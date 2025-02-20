package models

type BaseUrl struct {
	Slug                string `json:"slug" validate:"required,alphanum,min=1,max=50"`
	GeneralRedirectPath string `json:"general_redirect_path" validate:"required,url"`
	IosRedirectPath     string `json:"ios_redirect_path" validate:"omitempty,url"`
}

type CreateUrlBase struct {
	GeneralRedirectPath string `json:"general_redirect_path" validate:"required,url"`
	IosRedirectPath     string `json:"ios_redirect_path" validate:"omitempty,url"`
}

type UrlResponse struct {
	*BaseUrl  `tstype:",extends,required"`
	ID        string `json:"id" validate:"required,uuid"`
	CreatedAt string `json:"created_at" validate:"required,datetime=2000-01-01T12:30:00Z07:00"`
}
type CreateUrlRequest struct {
	*CreateUrlBase `tstype:",extends,required"`
	Type           string `json:"type" validate:"required,oneof=static direct"`
	Expiration     string `json:"expiration" validate:"omitempty,datetime=2006-01-02T15:04:05Z07:00"`
}
type UpdateUrlRequest struct {
	*CreateUrlBase `tstype:",extends,required"`
	ID             string `json:"id" validate:"required,uuid"`
}
type DeleteUrlRequest struct {
	ID string `json:"id" validate:"required,uuid"`
}

type DeleteUrlResponse struct {
	Success bool `json:"success" validate:"required,boolean"`
}
type GetAllUrlsResponse []UrlResponse

type GetRandomSlugResponse struct {
	Slug string `json:"slug"`
}

type CreateUrlResponse struct {
	ID         int32  `json:"id" validate:"required,uuid"`
	Slug       string `json:"slug" validate:"required,url"`
	Expiration string `json:"expiration" validate:"omitempty,datetime=2006-01-02T15:04:05Z07:00"`
}
