/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Student } from "../types";
import { X, Send, User, Sparkles } from "lucide-react";

interface StudentChatWindowProps {
  student: Student;
  onClose: () => void;
  onSendMessage: (text: string) => void;
  onTypingChange?: (isTyping: boolean) => void;
}

export default function StudentChatWindow({ student, onClose, onSendMessage, onTypingChange }: StudentChatWindowProps) {
  const [inputText, setInputText] = useState("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);

    if (onTypingChange) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      onTypingChange(true);
      typingTimeoutRef.current = setTimeout(() => {
        onTypingChange(false);
      }, 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText("");
    if (onTypingChange) {
      onTypingChange(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [student.mensagensChat]);

  const messages = student.mensagensChat || [];

  return (
    <div className="w-80 bg-slate-900 border border-sky-500/30 rounded-t-xl shadow-[0_0_30px_rgba(56,189,248,0.15)] flex flex-col h-96 animate-fade-in pointer-events-auto">
      {/* Header */}
      <div className="bg-slate-850 px-3.5 py-3 border-b border-white/10 flex justify-between items-center rounded-t-xl">
        <div className="flex items-center gap-2 truncate">
          <div className="relative">
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-slate-900 bg-emerald-500" />
            <div className="w-7 h-7 rounded-full bg-sky-505 font-sans text-xs font-black flex items-center justify-center text-sky-200 border border-sky-500/10">
              PF
            </div>
          </div>
          <div className="truncate">
            <span className="text-xs font-sans font-bold text-gray-100 flex items-center gap-1.5 truncate">
              Professor Fábio <span className="bg-sky-500/10 text-sky-400 font-mono text-[8px] px-1.5 py-0.2 rounded uppercase font-black uppercase tracking-wider">Online</span>
            </span>
            <span className="text-[9px] text-gray-400 block font-mono">
              Canal de IntraChat de Atendimento Imediato
            </span>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-450 hover:text-white transition-colors p-1">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Info Warning Bar */}
      <div className="bg-sky-950/20 border-b border-sky-500/10 px-3 py-1.5 text-[8.5px] text-sky-300 font-mono flex items-center gap-1 leading-normal select-none">
        <Sparkles className="w-3 h-3 text-sky-450 flex-shrink-0 animate-pulse" />
        <span>Suas mensagens e dúvidas vão direto ao painel Fábio sem travar sua estação.</span>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-slate-950/50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <p className="text-[10px] text-gray-500 font-mono">Conexão estabelecida.</p>
            <p className="text-[9px] text-gray-400 mt-1 font-sans leading-relaxed">
              Escreva abaixo sua dúvida técnica para e-Social ou andamento trabalhista corporativo. O Professor Fábio responderá em tempo real.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isSystem = msg.remetente === "Sistema";
            const isProfessor = msg.remetente === "Professor";

            if (isSystem) {
              const isAlert = msg.texto.includes("🚫") || msg.texto.includes("ALERTA") || msg.texto.includes("🔒");
              return (
                <div key={msg.id || idx} className={`p-2 rounded font-mono text-[8.5px] border leading-relaxed ${
                  isAlert 
                    ? "bg-rose-950/10 border-rose-500/10 text-rose-300/95" 
                    : "bg-slate-900/40 border-white/5 text-gray-450"
                }`}>
                  <div className="flex items-center justify-between text-[8px] text-gray-550 mb-0.5 font-bold uppercase">
                    <span>Notificação do Sistema</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <div>{msg.texto}</div>
                </div>
              );
            }

            // Student sent it if not system or professor
            const isMe = !isProfessor;

            return (
              <div 
                key={msg.id || idx} 
                className={`flex flex-col max-w-[85%] ${isMe ? "ml-auto items-end" : "mr-auto items-start"}`}
              >
                <div className={`p-2 rounded-lg text-xs leading-relaxed font-sans ${
                  isMe 
                    ? "bg-sky-600 text-white rounded-tr-none" 
                    : "bg-slate-800 text-gray-100 rounded-tl-none border border-white/5"
                }`}>
                  <p className="break-words">{msg.texto}</p>
                </div>
                <span className="text-[8px] font-mono text-gray-550 mt-1">
                  {isMe ? "Você (Aluno)" : "Professor Fábio"} • {msg.timestamp}
                </span>
              </div>
            );
          })
        )}
        {student.profIsTyping && (
          <div className="flex items-start gap-2 animate-pulse">
            <div className="w-6 h-6 rounded-full bg-sky-500/10 flex items-center justify-center shrink-0 border border-sky-500/20">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="bg-slate-800/40 border border-sky-500/10 px-2 py-1 rounded-lg">
              <span className="text-[9px] font-mono text-sky-400">Professor Fábio está escrevendo...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-2.5 border-t border-white/10 flex gap-2 bg-slate-900 rounded-b-xl">
        <input 
          type="text" 
          value={inputText}
          onChange={handleInputChange}
          placeholder="Digite sua dúvida trabalhista aqui..."
          className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-550 focus:outline-none focus:border-sky-500/50 transition-colors font-sans"
        />
        <button 
          type="submit" 
          disabled={!inputText.trim()}
          className="bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 text-slate-950 disabled:text-gray-500 transition-all p-2 rounded-lg cursor-pointer flex items-center justify-center disabled:cursor-not-allowed hover:shadow-[0_0_10px_rgba(56,189,248,0.25)]"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
