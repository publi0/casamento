package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/render"
	_ "github.com/go-sql-driver/mysql"
)

type GiftForm struct {
	Name   string
	Email  string
	Amount string
}

func (o *GiftForm) Bind(r *http.Request) error {
	return nil
}

func (o *GiftForm) Render(w http.ResponseWriter, r *http.Request) error {
	return nil
}

func main() {
	db, err := sql.Open("mysql", os.Getenv("DB_URL"))
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	r := chi.NewRouter()
	r.Use(middleware.Logger)

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", "http://*"},
		AllowedMethods:   []string{"POST", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	r.Post("/gifts", func(w http.ResponseWriter, r *http.Request) {
		giftData := GiftForm{}
		if err := render.Bind(r, &giftData); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte("error reaading input json"))
			slog.Error("error reading input json")
			return
		}

		outByte, err := json.Marshal(giftData)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte("error creating returning json"))
			slog.Error("error creating returning json")
			return
		}

		stmt, err := db.Prepare("INSERT INTO gift (name, email, amount) VALUES (?, ?, ?)")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			slog.Error("error connecting to databse")
			return
		}
		defer stmt.Close()
	
		result, err := stmt.Exec(giftData.Name, giftData.Email, giftData.Amount)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			slog.Error("error inseting to database")
			return
		}
		id, _ := result.LastInsertId()
		slog.Info("Inserted with success", "ID", id)

		w.Header().Add("id", fmt.Sprintf("%d", id))
		w.WriteHeader(http.StatusCreated)
		w.Write(outByte)
		slog.Info("returning request with success")
	})

	http.ListenAndServe(":3000", r)
}
