package configs

import (
	"os"
)

var stage = os.Getenv("STAGE_STATUS")

// Stage is a global variable for the current stage of the application.
// It can be "develop", "staging", or "production".
func Stage() string {
	return stage
}

// IsDev is a helper function to check if the current stage is "develop".
func IsDev() bool {
	return stage == "develop"
}
