/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Student } from "../types";
import { X, Send, AlertCircle } from "lucide-react";

interface ChatWindowProps {
  key?: string;
  student: Student;
  onClose: () => void;
  onSendMessage: (studentId: string, text: string) => void;
  onTypingChange?: (studentId: string, isTyping: boolean) => void;
  allStudents?: Student[];
  onAssignSquad?: (machineId: string, studentIds: string[]) => void;
  onAddStudentToSquad?: (machineId: string, studentId: string) => void;
}

export default function ChatWindow({ 
  student, 
  onClose, 
  onSendMessage,
  onTypingChange,
  allStudents = [],
  onAssignSquad,
  onAddStudentToSquad
}: ChatWindowProps) {
  const [inputText, setInputText] = useState("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedPeerId, setSelectedPeerId] = useState("");
  const [quickMachineId, setQuickMachineId] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);

    if (onTypingChange) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      onTypingChange(student.id, true);
      typingTimeoutRef.current = setTimeout(() => {
        onTypingChange(student.id, false);
      }, 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(student.id, inputText);
    setInputText("");
    if (onTypingChange) {
      onTypingChange(student.id, false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleAddPeerToCurrentSquad = () => {
    if (!student.timeId || !selectedPeerId || !onAddStudentToSquad) return;
    onAddStudentToSquad(student.timeId, selectedPeerId);
    
    const peerName = allStudents.find(s => s.id === selectedPeerId)?.nomeCompleto || "Estudante";
    onSendMessage(student.id, `✓ [Docente Fábio] Vinculou o aluno na máquina: ${peerName} associado ao mesmo Squad (${student.timeId}).`);
    setSelectedPeerId("");
  };

  const handleCreateNewSquadFromChat = () => {
    if (!quickMachineId.trim() || !selectedPeerId || !onAssignSquad) return;
    const cleanMachine = quickMachineId.trim().toUpperCase();
    
    onAssignSquad(cleanMachine, [student.id, selectedPeerId]);
    
    const peerName = allStudents.find(s => s.id === selectedPeerId)?.nomeCompleto || "Estudante";
    onSendMessage(student.id, `✓ [Docente Fábio] Ativou célula de trabalho [${cleanMachine}] em conjunto com ${peerName}.`);
    
    setSelectedPeerId("");
    setQuickMachineId("");
  };

  const activeTeammates = allStudents.filter(s => s.timeId && s.timeId === student.timeId && s.id !== student.id);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [student.mensagensChat]);

  const messages = student.mensagensChat || [];

  return (
    <div className="w-72 bg-slate-900 border border-white/10 rounded-t-lg shadow-2xl flex flex-col h-[470px] animate-fade-in pointer-events-auto">
      {/* Header */}
      <div className="bg-slate-800 px-3 py-2.5 border-b border-white/10 flex justify-between items-center rounded-t-lg">
        <div className="flex items-center gap-2 truncate">
          <div className="relative">
            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-slate-900 ${
              student.focoStatus === "Fora da Tela" ? "bg-rose-500 animate-pulse" : "bg-emerald-500"
            }`} />
            <div className="w-6 h-6 rounded-full bg-slate-705 font-sans text-[10px] font-black flex items-center justify-center text-gray-200">
              {student.nomeCompleto.substring(0, 2).toUpperCase()}
            </div>
          </div>
          <div className="truncate">
            <span className="text-xs font-sans font-bold text-gray-100 block truncate">
              {student.nomeCompleto}
            </span>
            <span className="text-[9px] text-gray-450 block font-mono">
              Sala: {student.sala} | F{student.faseAtual}
            </span>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Focus Warning Callout inside chat if the student is currently away */}
      {student.focoStatus === "Fora da Tela" && (
        <div className="bg-rose-950/40 border-b border-rose-500/25 px-3 py-1.5 flex items-center gap-1.5 text-[10px] text-rose-300 animate-pulse font-mono">
          <AlertCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
          <span>ALERTA: Aluno ausente ou trocou de tela!</span>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-slate-950/40">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <p className="text-[10px] text-gray-500 font-mono">Nenhuma atividade registrada.</p>
            <p className="text-[9px] text-gray-600 mt-1 font-sans leading-relaxed">Alertas de alteração de aba ou mensagens do canal serão listadas aqui.</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isSystem = msg.remetente === "Sistema";
            const isProfessor = msg.remetente === "Professor";

            if (isSystem) {
              const isAlert = msg.texto.includes("🚫") || msg.texto.includes("ALERTA");
              return (
                <div key={msg.id || idx} className={`p-2 rounded font-mono text-[9px] border leading-relaxed ${
                  isAlert 
                    ? "bg-rose-950/20 border-rose-500/10 text-rose-300/95" 
                    : "bg-slate-900 border-white/5 text-gray-400"
                }`}>
                  <div className="flex items-center justify-between text-[8px] text-gray-500 mb-0.5 font-bold uppercase">
                    <span>ALERTA DE FOCO</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <div>{msg.texto}</div>
                </div>
              );
            }

            return (
              <div 
                key={msg.id || idx} 
                className={`flex flex-col max-w-[85%] ${isProfessor ? "ml-auto items-end" : "mr-auto items-start"}`}
              >
                <div className={`p-2  rounded-lg text-[11px] leading-relaxed font-sans ${
                  isProfessor 
                    ? "bg-accent-primary text-white rounded-tr-none" 
                    : "bg-slate-850 text-gray-100 rounded-tl-none border border-white/5"
                }`}>
                  <p>{msg.texto}</p>
                </div>
                <span className="text-[8px] font-mono text-gray-500 mt-1">
                  {isProfessor ? "Você (Professor Fábio)" : msg.remetente} • {msg.timestamp}
                </span>
              </div>
            );
          })
        )}
        {student.isTyping && (
          <div className="flex items-start gap-2 animate-pulse">
            <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
              <span className="text-[8px] text-gray-400 font-black">...</span>
            </div>
            <div className="bg-slate-800/60 border border-white/5 px-2 py-1 rounded-lg">
              <span className="text-[9px] font-mono text-gray-400">Digitando...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* VINCULADOR DE SQUAD RAPIDO NO CHAT */}
      <div className="bg-slate-950/80 border-t border-white/10 p-2.5 space-y-2 flex-shrink-0 animate-fade-in font-sans text-xs">
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-mono font-bold uppercase text-accent-warning tracking-wider">
            ⚙️ Vincular Máquina (Squad)
          </span>
          {student.timeId ? (
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-500/20 font-bold">
              ESTAÇÃO: {student.timeId}
            </span>
          ) : (
            <span className="text-[9px] font-mono text-yellow-300 bg-yellow-500/10 px-1 py-0.5 rounded border border-yellow-500/20 font-bold">
              INDIVIDUAL
            </span>
          )}
        </div>

        {student.timeId ? (
          <div className="space-y-1 bg-slate-900/40 p-1.5 rounded border border-white/5">
            <p className="text-[9.5px] text-gray-400 leading-tight">
              Compartilhar esta máquina física com outro aluno (Lim. 4):
            </p>
            <div className="flex gap-1.5 mt-1">
              <select
                value={selectedPeerId}
                onChange={(e) => setSelectedPeerId(e.target.value)}
                className="flex-grow bg-slate-950 border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-white focus:outline-none focus:border-accent-warning font-sans"
              >
                <option value="">-- Selecione o Aluno --</option>
                {allStudents
                  ?.filter((s) => s.id !== student.id && s.timeId !== student.timeId)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      #{s.chamadaNumero || s.id} - {s.nomeCompleto}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={handleAddPeerToCurrentSquad}
                disabled={!selectedPeerId}
                className="bg-accent-warning hover:bg-white text-bg-primary disabled:opacity-30 px-2 py-0.5 rounded text-[9px] font-sans font-bold uppercase transition-all whitespace-nowrap cursor-pointer"
              >
                Vincular
              </button>
            </div>
            {activeTeammates.length > 0 && (
              <div className="text-[8.5px] font-mono text-gray-400 mt-1 leading-tight border-t border-white/5 pt-1">
                Ativos na mesma máquina:{" "}
                <span className="text-accent-warning font-sans">
                  {activeTeammates.map((m) => m.nomeCompleto).join(", ")}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-1 bg-slate-900/40 p-1.5 rounded border border-white/5">
            <p className="text-[9.5px] text-gray-450 leading-tight">
              Instalar estação compartilhada para este aluno e outro colega de squad:
            </p>
            <div className="flex gap-1 mt-1">
              <input
                type="text"
                value={quickMachineId}
                onChange={(e) => setQuickMachineId(e.target.value.toUpperCase())}
                placeholder="Ex: PC-01"
                className="w-14 bg-slate-950 border border-white/10 rounded px-1 py-0.5 text-[10px] text-accent-primary font-mono text-center focus:outline-none"
              />
              <select
                value={selectedPeerId}
                onChange={(e) => setSelectedPeerId(e.target.value)}
                className="flex-grow bg-slate-950 border border-white/10 rounded px-1 py-0.5 text-[10px] text-white focus:outline-none focus:border-accent-primary font-sans"
              >
                <option value="">-- Com quem? --</option>
                {allStudents
                  ?.filter((s) => s.id !== student.id && !s.timeId)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      #{s.chamadaNumero || s.id} - {s.nomeCompleto}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={handleCreateNewSquadFromChat}
                disabled={!quickMachineId.trim() || !selectedPeerId}
                className="bg-accent-primary hover:bg-white text-white hover:text-bg-primary disabled:opacity-35 px-1.5 py-0.5 rounded text-[9px] font-sans font-semibold uppercase transition-all whitespace-nowrap cursor-pointer"
              >
                Criar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-2 border-t border-white/10 flex gap-1.5 bg-slate-900">
        <input 
          type="text" 
          value={inputText}
          onChange={handleInputChange}
          placeholder="Enviar mensagem para o aluno..."
          className="flex-1 bg-slate-1000 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-primary/50 transition-colors font-sans"
        />
        <button 
          type="submit" 
          disabled={!inputText.trim()}
          className="text-accent-primary hover:text-white disabled:text-gray-650 transition-colors bg-accent-primary/10 hover:bg-accent-primary/20 p-1.5 rounded cursor-pointer border border-accent-primary/20 disabled:border-transparent flex items-center justify-center"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
