package authStore

import (
	"crypto/rand"
	"encoding/hex"
	"golang.org/x/crypto/bcrypt"
)

// PasswordHashingCost This should be tuned with cation it can be a heavy performance bottleneck
// PasswordHashingCost between 4 and 31
const PasswordHashingCost = 10

func HashPassword(password string) (string, error) {
	// No need for salt bcrypt will generate a random salt under the hood
	// salt := generateSalt(12) // Generate a random salt
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), PasswordHashingCost)
	if err != nil {
		return "", err
	}

	return string(hashedPassword), nil
}

func ComparePasswords(password, hashedPassword string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}

// generateSalt @Deprecated
func generateSalt(length int) string {
	salt := make([]byte, length)
	_, err := rand.Read(salt)
	if err != nil {
		panic(err) // Handle error appropriately in production code
	}
	return hex.EncodeToString(salt)
}
