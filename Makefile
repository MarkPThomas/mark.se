default:
	@echo "Mark.se CLI"
	@echo ""
	@echo "Usage:"
	@echo "== Project =="
	@echo "\tmake init               # Initializes a fresh project with new .env variables, dependency installations, images, services, and built frontends"
	@echo "\tmake init_setup         # Initializes fresh .env variables and installs all node dependencies in the project"
	@echo "\tmake init_start_project # Initializes all frontends in the project and any related images and services"
	@echo "\tmake clear_project      # Deletes all .env files and installed node dependencies in the project"
	@echo ""
	@echo "=== Files ==="
	@echo "\tmake setup_envs         # Copies all .env.example files as .env where .env doesn't exist"
	@echo "\tmake delete_envs        # Deletes all .env files from packages"
	@echo "\tmake install_deps       # Installs all node dependencies required for project"
	@echo "\tmake delete_deps        # Deletes all node dependencies required for project"
	@echo ""
	@echo "=== Containers ==="
	@echo ""
	@echo "=== Databases ==="
	@echo ""
	@echo "=== Builds ==="
	@echo "\tmake build_frontends    # Builds the frontend of all apps"
	@echo "\tmake build_weather_ly   # Builds the frontend to the weather.ly app"
	@echo ""
	@echo "=== Services ==="

# Project
init: init_setup init_start_project

init_setup: delete_envs setup_envs install_deps

init_start_project: build_frontends

clear_project: delete_deps delete_envs

# Files
setup_envs:
	@echo "Generating .env files from .env.example files..."
	find ./packages -name ".env.example" -exec dirname {} \; | exargs -t -I % cp -n %/.env.example %/.env

delete_envs:
	@echo "Deleting all .env files from project..."
	fing .packages -name ".env" | exargs -t -r -n 1 rm

install_deps:
	@echo "Installing all dependencies in project..."
	yarn
	@while read p; do \
		echo "Installing dependencies for $$p ..."; \
		cd "$$p" && yarn && cd $$(git rev-parse --show-toplevel); \
	done <packages-list.txt

delete_deps:
	@echo "Deleting all dependencies from project..."
	find . -type d -name 'node_modules' -prune -exec rm -Rf '{}' +

# Containers

# Databases

# Builds
build_weather_ly:
	@echo "Building cad.se..."
	cd ./packages/app/ui; yarn build

build_frontends: build_cad_se

# Services
