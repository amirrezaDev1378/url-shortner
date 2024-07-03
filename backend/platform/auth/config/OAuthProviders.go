package authConfig

import (
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"os"
)

type ProviderType struct {
	oauth2.Config
	UserInfoUrl string
}

type OAuthConfig struct {
	Providers map[string]ProviderType
}

func GetOAuthProviders() map[string]ProviderType {
	providers := make(map[string]ProviderType)

	if os.Getenv("GOOGLE_CLIENT_ID") != "" && os.Getenv("GOOGLE_CLIENT_SECRET") != "" {
		providers["google"] = ProviderType{
			Config: oauth2.Config{
				RedirectURL:  os.Getenv("FRONTEND_URL") + "/auth/handle-oauth?provider=google",
				ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
				ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
				Scopes: []string{
					"https://www.googleapis.com/auth/userinfo.email",
					"https://www.googleapis.com/auth/userinfo.profile",
				},
				Endpoint: google.Endpoint,
			},
			UserInfoUrl: "https://www.googleapis.com/oauth2/v2/userinfo?access_token=",
		}
	}

	return providers
}
