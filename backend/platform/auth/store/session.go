package authStore

import (
	"github.com/gofiber/fiber/v2"
	"time"
)

type UserSessionData struct {
	// if you use Id this will fucking force you to use int type! wtf ?
	UserId        string `json:"id"`
	SessionExpiry string `json:"exp"`
}

func (p *Params) CreateSessionCookie(c *fiber.Ctx, userId string) error {
	store, err := p.SessionStore.Get(c)
	if err != nil {
		return err
	}
	userData := UserSessionData{
		UserId:        userId,
		SessionExpiry: time.Now().Add(time.Hour * time.Duration(MaxSessionLife)).Format(time.DateTime),
	}

	err = store.Destroy()
	if err != nil {
		return err
	}
	store.Set(UserInfoCookieKey, userData)
	err = store.Save()
	if err != nil {
		return err
	}
	return nil
}

func (p *Params) GetUserSessionData(c *fiber.Ctx) (UserSessionData, error) {
	// TODO : optimize this
	store, err := p.SessionStore.Get(c)
	userInfo := UserSessionData{}
	if err != nil {
		return userInfo, ErrInvalidTokenData
	}
	userInfo, ok := store.Get(UserInfoCookieKey).(UserSessionData)
	if !ok {
		return userInfo, ErrInvalidTokenData
	}
	expiry, err := time.Parse(time.DateTime, userInfo.SessionExpiry)
	if err != nil {
		return userInfo, err
	}

	elapsedTime := time.Hour*time.Duration(MaxSessionLife) - time.Until(expiry)
	if elapsedTime > time.Minute*time.Duration(MaxTokenLife) {

		/** TODO:- this is a temp fix investigate the process further */

		//err = store.Regenerate()
		//if err != nil {
		//	return userInfo, err
		//}
		userInfo.SessionExpiry = time.Now().Add(time.Hour * time.Duration(MaxSessionLife)).Format(time.DateTime)
		store.SetExpiry(time.Hour * time.Duration(MaxSessionLife))
		store.Set(UserInfoCookieKey, userInfo)
		err = store.Save()
		if err != nil {
			return userInfo, err
		}
	}
	return userInfo, nil
}

func (p *Params) DestroySessionCookie(c *fiber.Ctx) error {
	store, err := p.SessionStore.Get(c)
	if err != nil {
		return err
	}

	err = store.Destroy()
	c.Locals("userID", "")
	if err != nil {
		return err
	}
	return nil
}
