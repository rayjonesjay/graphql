package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

var (
	Domain = "learn.zone01kisumu.ke"
	Auth   = fmt.Sprintf("https://%s/auth/signin", Domain)
)

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Jwt     string `json:"jwt,omitempty"`
	Message string `json:"message,omitempty"`
	Error   string `json:"error,omitempty"`
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	// CORS headers
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != "POST" {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	// Parse request body
	var lr LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&lr); err != nil {
		http.Error(w, `{"error":"Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if lr.Username == "" || lr.Password == "" {
		http.Error(w, `{"error":"Username and password are required"}`, http.StatusBadRequest)
		return
	}

	// Make request to Zone01 auth endpoint
	req, err := http.NewRequest("POST", "https://learn.zone01kisumu.ke/api/auth/signin", nil)
	if err != nil {
		http.Error(w, `{"error":"Error creating request"}`, http.StatusInternalServerError)
		return
	}
	req.SetBasicAuth(lr.Username, lr.Password)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, `{"error":"Error connecting to auth server"}`, http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		fmt.Printf("Auth failed. Status: %d, Body: %s\n", resp.StatusCode, string(bodyBytes))
		http.Error(w, `{"error":"Authentication failed"}`, http.StatusUnauthorized)
		return
	}

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		http.Error(w, `{"error":"Error reading auth response"}`, http.StatusInternalServerError)
		return
	}
	jwt := strings.TrimSpace(string(bodyBytes))

	prefix := "\""
	cookieJWT := strings.TrimPrefix(jwt, prefix)
	cookieJWT = strings.TrimSuffix(cookieJWT, prefix)

	http.SetCookie(w, &http.Cookie{
		Name:     "jwt",
		Value:    cookieJWT,
		Path:     "/",
		Expires:  time.Now().Add(24 * time.Hour),
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})

	fmt.Println("original:", jwt)
	fmt.Println("\n\ncookie:", cookieJWT)
	// this is for local storage
	lResp := LoginResponse{
		Jwt:     cookieJWT,
		Message: "Authentication successful",
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(lResp)
}
