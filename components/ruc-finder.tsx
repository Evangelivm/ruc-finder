"use client";

import type React from "react";

import { use, useState, useTransition, useEffect } from "react";
import { searchRuc, addRuc, resetPassword } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Search, AlertCircle } from "lucide-react";

export function RucFinder() {
  const [ruc, setRuc] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [searchPromise, setSearchPromise] = useState<Promise<{
    exists: boolean;
    name?: string;
  }> | null>(null);
  const [addPromise, setAddPromise] = useState<Promise<{
    success: boolean;
  }> | null>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Get search result using the use hook when searchPromise is available
  const searchResult = searchPromise ? use(searchPromise) : null;

  // Get add result using the use hook when addPromise is available
  const addResult = addPromise ? use(addPromise) : null;

  // Update search result when add is successful
  useEffect(() => {
    if (addResult?.success) {
      setSearchPromise(Promise.resolve({ exists: true, name: companyName }));
      setMessage({ type: "success", text: "RUC agregado exitosamente" });
    }
  }, [addResult, companyName]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruc || ruc.length < 8) {
      setMessage({ type: "error", text: "Por favor ingrese un RUC válido" });
      return;
    }

    setMessage(null);

    // Use startTransition to avoid blocking the UI during the search
    startTransition(() => {
      const promise = searchRuc(ruc);
      setSearchPromise(promise);

      // Handle "not found" message after the promise resolves
      promise
        .then((result) => {
          if (!result.exists) {
            setMessage({
              type: "error",
              text: "RUC no encontrado. Puede agregarlo a continuación.",
            });
          }
        })
        .catch(() => {
          setMessage({
            type: "error",
            text: "Error al buscar el RUC. Intente nuevamente.",
          });
        });
    });
  };

  const handleAddRuc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruc || !companyName) {
      setMessage({
        type: "error",
        text: "Por favor complete todos los campos",
      });
      return;
    }

    setMessage(null);

    // Use startTransition to avoid blocking the UI during the add operation
    startTransition(() => {
      const promise = addRuc(ruc, companyName);
      setAddPromise(promise);

      promise.catch(() => {
        setMessage({
          type: "error",
          text: "Error al agregar el RUC. Intente nuevamente.",
        });
      });
    });
  };

  const resetForm = () => {
    setRuc("");
    setCompanyName("");
    setSearchPromise(null);
    setAddPromise(null);
    setMessage(null);
  };

  // Agregar esta función dentro del componente RucFinder antes del return
  const handleResetPassword = () => {
    if (!ruc) return;

    startTransition(() => {
      resetPassword(ruc)
        .then(() => {
          setMessage({
            type: "success",
            text: "Contraseña reiniciada exitosamente",
          });
        })
        .catch(() => {
          setMessage({
            type: "error",
            text: "Error al reiniciar la contraseña",
          });
        });
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Buscador de RUC</CardTitle>
        <CardDescription>
          Ingrese el número de RUC para verificar si existe en nuestra base de
          datos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"}>
            {message.type === "error" ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ruc">Número de RUC</Label>
            <div className="flex space-x-2">
              <Input
                id="ruc"
                placeholder="Ingrese el RUC"
                value={ruc}
                onChange={(e) => setRuc(e.target.value)}
              />
              <Button type="submit" disabled={isPending}>
                {isPending && !searchResult ? (
                  "Buscando..."
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </form>

        {searchResult && searchResult.exists && (
          <div className="space-y-4">
            <div className="p-4 border rounded-md bg-muted">
              <p className="font-medium">RUC encontrado</p>
              <p className="text-sm text-muted-foreground">
                Empresa: {searchResult.name}
              </p>
            </div>
            <Button
              className="w-full"
              variant="default"
              onClick={handleResetPassword}
              disabled={isPending}
            >
              {isPending ? "Reiniciando..." : "Reiniciar Contraseña"}
            </Button>
            <Button variant="outline" className="w-full" onClick={resetForm}>
              Nueva Búsqueda
            </Button>
          </div>
        )}

        {searchResult && !searchResult.exists && (
          <form onSubmit={handleAddRuc} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Nombre de la Empresa</Label>
              <Input
                id="companyName"
                placeholder="Ingrese el nombre de la empresa"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div className="flex space-x-2">
              <Button type="submit" className="flex-1" disabled={isPending}>
                {isPending && !addResult ? "Agregando..." : "Agregar RUC"}
              </Button>
              <Button variant="outline" onClick={resetForm} className="flex-1">
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
