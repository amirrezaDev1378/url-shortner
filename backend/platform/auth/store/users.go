/*
TODO: - split functions in different files
*/

package authStore

import (
	"context"
	"encoding/json"
	"errors"
	appErrors "github.com/create-go-app/fiber-go-template/pkg/errors"
	u "github.com/create-go-app/fiber-go-template/pkg/utils"
	dbQueries "github.com/create-go-app/fiber-go-template/platform/database/generated"
	sLog "github.com/create-go-app/fiber-go-template/platform/logger/serverLogger"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"os"
	"strconv"
	"time"
)

type StorableUser struct {
	Email     string      `json:"email" Validate:"email,required,max=100"`
	Avatar    pgtype.Text `json:"picture" Validate:"required_if=OAuthUser true,omitempty,url"`
	Password  string      `json:"password" Validate:"required_if=OAuthUser false,omitempty,min=6,max=20"`
	OAuthUser bool        `Validate:"boolean"`
	isValid   bool
}

const UserInfoCookieKey = "UserInfo"

var (
	MaxSessionLife, _ = strconv.Atoi(os.Getenv("SESSION_COOKIE_LIFETIME"))
	MaxTokenLife, _   = strconv.Atoi(os.Getenv("TOKEN_LIFETIME"))
)

func (user *StorableUser) Validate() error {
	valid := u.NewPgTypeValidator()
	err := valid.Struct(user)
	if err == nil {
		user.isValid = true
	}
	return err
}

func (user *StorableUser) FillJson(userByte []byte) error {
	if err := json.Unmarshal(userByte, user); err != nil {
		return errors.New("error parsing user data")
	}
	err := user.Validate()
	if err != nil {
		return err
	}

	return nil
}

func (p *Params) UserExists(ctx context.Context, user StorableUser) (bool, error) {
	if !user.isValid {
		return false, errors.New("invalid user data")
	}
	exists, err := p.DB.AppQueries.CheckUserExists(ctx, user.Email)
	if err != nil {
		return false, errors.New("failed db query")
	}

	return exists, nil
}

func (p *Params) CreateUserWithOAuth(ctx context.Context, user StorableUser) (createdUserId string, serverError appErrors.ServerError) {

	// check if data is valid
	if !user.isValid {
		sLog.Error().Msg("ERR: user is not valid.")
		return "", appErrors.ServerError{Status: 500, Message: appErrors.ErrServerErr}
	}

	// Save to database

	userUUID, err := p.DB.AppQueries.CreateUser(ctx, dbQueries.CreateUserParams{
		Avatar:         user.Avatar,
		Email:          user.Email,
		CreatedByOauth: pgtype.Bool{Bool: true, Valid: true},
	})
	if err != nil {
		sLog.Err(err).Send()
		return "", appErrors.ServerError{Status: 500, Message: appErrors.ErrServerErr}
	}
	userId, err := userUUID.Value()
	userIdString, ok := userId.(string)
	if err != nil || !ok {
		return "", appErrors.ServerError{Status: 500, Message: appErrors.ErrServerErr}
	}
	return userIdString, appErrors.ServerError{}
}
func (p *Params) LoginWithOAuth(ctx context.Context, user StorableUser) (createdUserId string, serverError appErrors.ServerError) {

	// check if data is valid
	if !user.isValid {
		return "", appErrors.ServerError{Status: 500, Message: appErrors.ErrServerErr}
	}
	userUUID, err := p.DB.AppQueries.UserLoginWithOAuth(ctx, user.Email)
	if err != nil {
		return "", appErrors.ServerError{Status: 500, Message: appErrors.ErrAccessingOAuthUser}
	}
	userId, err := userUUID.Value()
	userIdString, ok := userId.(string)
	if err != nil || !ok {
		return "", appErrors.ServerError{Status: 500, Message: appErrors.ErrServerErr}
	}

	return userIdString, appErrors.ServerError{}
}
func (p *Params) CreateUserWithCredentials(ctx context.Context, user StorableUser) (createdUserId string, serverError appErrors.ServerError) {
	// check if data is valid
	if !user.isValid {
		return "", appErrors.ServerError{Status: 500, Message: appErrors.ErrServerErr}
	}
	hashedPassword, err := HashPassword(user.Password)
	if err != nil {
		return "", appErrors.ServerError{Status: 500, Message: appErrors.ErrServerErr}
	}

	userUUID, err := p.DB.AppQueries.CreateUser(ctx, dbQueries.CreateUserParams{
		Email:          user.Email,
		Password:       hashedPassword,
		CreatedByOauth: pgtype.Bool{Bool: false, Valid: true},
	})
	if err != nil {
		return "", appErrors.ServerError{Status: 500, Message: appErrors.ErrServerErr}
	}
	userId, err := userUUID.Value()
	userIdString, ok := userId.(string)
	if err != nil || !ok {
		return "", appErrors.ServerError{Status: 500, Message: appErrors.ErrServerErr}
	}

	return userIdString, appErrors.ServerError{}
}
func (p *Params) LoginWithCredentials(ctx context.Context, storableUser StorableUser) (createdUserId string, serverError appErrors.ServerError) {
	// check if data is valid
	if !storableUser.isValid {
		return "", appErrors.ServerError{Status: 400, Message: appErrors.ErrInvalidPayload}
	}
	user, err := p.DB.AppQueries.GetUserByEmail(ctx, storableUser.Email)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return "", appErrors.ServerError{Status: 400, Message: appErrors.ErrUserNotFound}
		}
		return "", appErrors.ServerError{Status: 500, Message: appErrors.ErrServerErr}
	}

	isAccountLocked := user.LockedUntil.Valid && user.LockedUntil.Time.After(time.Now())
	if isAccountLocked {
		return "", appErrors.ServerError{Status: 403, Message: appErrors.ErrUserLocked}
	}

	hasInvalidLoginAttempts := user.LoginAttempts >= MaxLoginAttempts
	hasValidPassword := ComparePasswords(storableUser.Password, user.Password) == nil
	if !hasValidPassword {
		hasInvalidLoginAttempts = user.LoginAttempts+1 >= MaxLoginAttempts
	}
	if hasInvalidLoginAttempts {
		return "", lockUserAccount(ctx, p.DB.AppQueries, &user)
	}
	if !hasValidPassword {
		return "", incrementLoginAttempts(ctx, p.DB.AppQueries, &user)
	}

	err = resetLoginAttemptsIfRequired(ctx, p.DB.AppQueries, &user)
	if err != nil {
		return "", appErrors.ServerError{Status: 500, Message: appErrors.ErrServerErr}
	}
	err = p.DB.AppQueries.UserLoginWithCredential(ctx, user.ID)
	if err != nil {
		return "", appErrors.ServerError{Status: 500, Message: appErrors.ErrServerErr}
	}
	userId, err := user.ID.Value()
	userIdString, ok := userId.(string)
	if err != nil || !ok {
		return "", appErrors.ServerError{Status: 500, Message: appErrors.ErrServerErr}
	}
	return userIdString, appErrors.ServerError{}

}

func incrementLoginAttempts(ctx context.Context, queries *dbQueries.Queries, user *dbQueries.User) appErrors.ServerError {
	err := queries.UpdateFailedLoginAttempts(ctx, dbQueries.UpdateFailedLoginAttemptsParams{
		ID:            user.ID,
		LoginAttempts: user.LoginAttempts + 1,
	})
	if err != nil {
		return appErrors.ServerError{Status: 500, Message: appErrors.ErrServerErr}
	}
	return appErrors.ServerError{Status: 400, Message: appErrors.ErrUserNotFound}
}

func resetLoginAttemptsIfRequired(ctx context.Context, queries *dbQueries.Queries, user *dbQueries.User) error {
	if user.LoginAttempts == 0 && !user.LockedUntil.Valid {
		return nil
	}
	return queries.UpdateFailedLoginAttempts(ctx, dbQueries.UpdateFailedLoginAttemptsParams{
		ID:            user.ID,
		LoginAttempts: 0,
		LockedUntil:   pgtype.Timestamp{Valid: false},
	})
}

func lockUserAccount(ctx context.Context, queries *dbQueries.Queries, user *dbQueries.User) appErrors.ServerError {
	lockedUntil := pgtype.Timestamp{
		Valid: true,
		Time:  time.Now().Add(UserAccountLockDuration),
	}
	err := queries.UpdateFailedLoginAttempts(ctx, dbQueries.UpdateFailedLoginAttemptsParams{
		ID:            user.ID,
		LoginAttempts: 0,
		LockedUntil:   lockedUntil,
	})
	if err != nil {
		return appErrors.ServerError{}
	}
	return appErrors.ServerError{Status: 403, Message: appErrors.ErrUserLocked}
}
