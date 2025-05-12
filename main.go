package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"strconv"
)

func main() {
	var port = 8080
	flag.IntVar(&port, "p", port, "port to listen on")
	flag.Parse()

	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	http.HandleFunc("/profile", func(w http.ResponseWriter, r *http.Request) {
		c, err := r.Cookie("jwt")
		if err != nil || c.Value == "" {
			http.Redirect(w, r, "/", http.StatusFound)
			return
		}
		http.ServeFile(w, r, "./static/index.html")
	})

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		c, err := r.Cookie("jwt")
		if err == nil && c.Value != "" {
			http.Redirect(w, r, "/profile", http.StatusFound)
			return
		}
		http.ServeFile(w, r, "./static/login.html")
	})

	http.HandleFunc("/api/login", LoginHandler)

	address := ":" + strconv.Itoa(port)
	fmt.Println("Server running at http://localhost" + address)
	log.Fatal(http.ListenAndServe(address, nil))
}
