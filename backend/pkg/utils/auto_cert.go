package utils

import (
	"crypto/tls"
	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/acme/autocert"
)

// ListenWithAutoCert This should only be used for development
func ListenWithAutoCert(app *fiber.App) {
	m := &autocert.Manager{
		Prompt:     autocert.AcceptTOS,
		HostPolicy: autocert.HostWhitelist("127.0.0.1", "api.u.bz"),
		Cache:      autocert.DirCache("./certs"),
	}

	cfg := &tls.Config{
		GetCertificate: m.GetCertificate,
		NextProtos: []string{
			"http/1.1", "acme-tls/1",
		},
	}
	ln, err := tls.Listen("tcp", "127.0.0.1:3033", cfg)
	if err != nil {
		panic(err)
	}

	err = app.Listener(ln)
	if err != nil {
		panic(err)
	}
}
