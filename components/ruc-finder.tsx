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
import {
  rucSchema,
  companyNameSchema,
  addRucSchema,
} from "@/app/libs/validations";
import { z } from "zod";

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
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const searchResult = searchPromise ? use(searchPromise) : null;
  const addResult = addPromise ? use(addPromise) : null;

  useEffect(() => {
    if (addResult?.success) {
      setSearchPromise(Promise.resolve({ exists: true, name: companyName }));
      setMessage({ type: "success", text: "RUC agregado exitosamente" });
    }
  }, [addResult, companyName]);

  const validateRuc = (value: string) => {
    try {
      rucSchema.parse(value);
      setMessage(null);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setMessage({
          type: "error",
          text: error.errors[0].message,
        });
      }
      return false;
    }
  };

  const handleRucChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setRuc(value);

    // Limpiar timeout anterior si existe
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Validación inmediata si se llega a 11 dígitos
    if (value.length === 11) {
      validateRuc(value);
      return;
    }

    // Validación después de pausa para otros casos
    if (value.length > 0) {
      const newTimeoutId = setTimeout(() => {
        validateRuc(value);
      }, 500);
      setTimeoutId(newTimeoutId);
    } else {
      setMessage(null);
    }
  };

  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCompanyName(value);

    if (value.length > 0) {
      try {
        companyNameSchema.parse(value);
        setMessage(null);
      } catch (error) {
        if (error instanceof z.ZodError) {
          setMessage({
            type: "error",
            text: error.errors[0].message,
          });
        }
      }
    } else {
      setMessage(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRuc(ruc)) return;

    setMessage(null);
    startTransition(() => {
      const promise = searchRuc(ruc);
      setSearchPromise(promise);

      promise
        .then((result) => {
          if (!result.exists) {
            setMessage({
              type: "error",
              text: "RUC no encontrado. Puede agregarlo a continuación.",
            });
          }
        })
        .catch((error) => {
          setMessage({
            type: "error",
            text:
              error.message || "Error al buscar el RUC. Intente nuevamente.",
          });
        });
    });
  };

  const handleAddRuc = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validatedData = addRucSchema.parse({ ruc, companyName });
      setMessage(null);

      startTransition(() => {
        const promise = addRuc(validatedData.ruc, validatedData.companyName);
        setAddPromise(promise);

        promise.catch((error) => {
          setMessage({
            type: "error",
            text:
              error.message || "Error al agregar el RUC. Intente nuevamente.",
          });
        });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        setMessage({
          type: "error",
          text: error.errors[0].message,
        });
      }
    }
  };

  const handleResetPassword = () => {
    if (!validateRuc(ruc)) return;

    startTransition(() => {
      resetPassword(ruc)
        .then(() => {
          setMessage({
            type: "success",
            text: "Contraseña reiniciada exitosamente",
          });
        })
        .catch((error) => {
          setMessage({
            type: "error",
            text: error.message || "Error al reiniciar la contraseña",
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
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

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
                onChange={handleRucChange}
                maxLength={11}
                className={message?.type === "error" ? "border-red-500" : ""}
              />
              <Button
                type="submit"
                disabled={isPending || !ruc || message?.type === "error"}
              >
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
                onChange={handleCompanyNameChange}
                className={message?.type === "error" ? "border-red-500" : ""}
              />
            </div>
            <div className="flex space-x-2">
              <Button
                type="submit"
                className="flex-1"
                disabled={
                  isPending || !companyName || message?.type === "error"
                }
              >
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
