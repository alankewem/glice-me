"use client";

import { useState, useEffect, useRef } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Share2, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

type GlicemiaRecord = {
  date: Date;
  level: number;
};

export default function GlicemiaApp() {
  const [date, setDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [glicoseLevel, setGlicoseLevel] = useState<string>("");
  const [records, setRecords] = useState<GlicemiaRecord[]>([]);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [shareLink, setShareLink] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedRecords = localStorage.getItem("glicemiaRecords");
    if (savedRecords) {
      setRecords(
        JSON.parse(savedRecords).map((record: GlicemiaRecord) => ({
          ...record,
          date: new Date(record.date),
        }))
      );
    }

    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const saveRecord = () => {
    if (glicoseLevel) {
      const newRecord: GlicemiaRecord = {
        date: date,
        level: parseFloat(glicoseLevel),
      };

      const updatedRecords = [...records, newRecord].sort(
        (a, b) => b.date.getTime() - a.date.getTime()
      );

      setRecords(updatedRecords);
      localStorage.setItem("glicemiaRecords", JSON.stringify(updatedRecords));
      setGlicoseLevel("");
    }
  };

  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };

  const generateShareLink = () => {
    // Simula a geração de um link de compartilhamento
    const randomString = Math.random().toString(36).substring(2, 15);
    return `https://glicemia-app.com/share/${randomString}`;
  };

  const handleShare = () => {
    const link = generateShareLink();
    setShareLink(link);
    setShowShareModal(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink).then(
      () => {
        setIsCopied(true);
        toast({
          title: "Link copiado!",
          description: "O link foi copiado para a área de transferência.",
        });
        setTimeout(() => setIsCopied(false), 2000);
      },
      (err) => {
        console.error("Erro ao copiar link:", err);
        toast({
          title: "Erro ao copiar",
          description: "Não foi possível copiar o link. Por favor, tente novamente.",
          variant: "destructive",
        });
      }
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Registro de Glicemia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={toggleCalendar}
                aria-label={showCalendar ? "Fechar calendário" : "Abrir calendário"}
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                {date.toLocaleDateString("pt-BR")}
              </Button>
            </div>
            {showCalendar && (
              <div ref={calendarRef}>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    if (newDate) {
                      setDate(newDate);
                      setShowCalendar(false);
                    }
                  }}
                  disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                  className="rounded-md border"
                />
              </div>
            )}
            <div className="flex space-x-2">
              <Input
                type="number"
                step="0.1"
                value={glicoseLevel}
                onChange={(e) => setGlicoseLevel(e.target.value)}
                placeholder="Nível de glicose"
                aria-label="Nível de glicose"
              />
              <Button onClick={saveRecord}>Salvar</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="mt-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Registros</CardTitle>
          <Button
            variant="outline"
            size="icon"
            onClick={handleShare}
            aria-label="Compartilhar registros"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {records.map((record, index) => (
              <li key={index} className="flex justify-between items-center">
                <span>
                  {record.date.toLocaleDateString("pt-BR")} - {record.date.toLocaleTimeString()}
                </span>
                <span>{record.level} mg/dL</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link de Compartilhamento</DialogTitle>
            <DialogDescription>Este link expira automaticamente em 24 horas.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <Input value={shareLink} readOnly className="flex-grow" />
            <Button onClick={copyToClipboard} size="icon" variant="outline">
              {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
