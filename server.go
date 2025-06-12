package main

import (
	"encoding/json"
	"io"
	"net/http"
	"strings"
	"time"
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

	var lr LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&lr); err != nil {
		http.Error(w, `{"error":"Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if lr.Username == "" || lr.Password == "" {
		http.Error(w, `{"error":"Username and password are required"}`, http.StatusBadRequest)
		return
	}

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
		http.Error(w, `{"error":"Authentication failed: Check your login credentials"}`, http.StatusUnauthorized)
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

	lResp := LoginResponse{
		Jwt:     cookieJWT,
		Message: "Authentication successful",
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(lResp)
}
