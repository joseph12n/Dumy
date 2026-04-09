import { useEffect, useRef, useState } from 'react';
import { useChat } from '../hooks/useChat';
import Card from '../components/Card';

export default function Chat() {
  const { messages, isResponding, error, sendMessage, clearSession } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    await sendMessage(input);
    setInput('');
  };

  const handleClear = () => {
    if (window.confirm('Estas seguro de que quieres limpiar el chat?')) {
      clearSession();
    }
  };

  return (
    <div className="page-chat">
      <h1>Chatbot de IA Financiero</h1>

      <div className="chat-container">
        <Card className="chat-messages">
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#999', padding: 20 }}>
              <p>Inicia una conversacion con tu asistente financiero personal</p>
              <p style={{ fontSize: 12, marginTop: 10 }}>Pregunta sobre tus gastos, presupuestos, tendencias y mas</p>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map((msg, idx) => (
                <div key={idx} className={`message ${msg.role}`}>
                  <div className="message-avatar">{msg.role === 'user' ? '👤' : '🤖'}</div>
                  <div className="message-content">
                    <p>{msg.content}</p>
                    <small className="message-time">{new Date(msg.createdAt).toLocaleTimeString('es-CO')}</small>
                  </div>
                </div>
              ))}
              {isResponding && (
                <div className="message assistant">
                  <div className="message-avatar">🤖</div>
                  <div className="message-content">
                    <p className="typing-indicator"><span></span><span></span><span></span></p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </Card>

        {error && <div className="error-box" style={{ marginTop: 10 }}>{error}</div>}

        <form onSubmit={handleSend} className="chat-input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregunta algo sobre tus finanzas..."
            disabled={isResponding}
            className="chat-input"
          />
          <button type="submit" disabled={isResponding || !input.trim()} className="btn btn-primary">
            {isResponding ? 'Respondiendo...' : 'Enviar'}
          </button>
          {messages.length > 0 && (
            <button type="button" onClick={handleClear} disabled={isResponding} className="btn btn-secondary" title="Limpiar chat">
              Limpiar
            </button>
          )}
        </form>
      </div>

      {messages.length === 0 && (
        <Card title="Ejemplos de preguntas" className="mt-4">
          <div className="suggestions">
            {[
              'Como van mis gastos este mes?',
              'En que categoria gasto mas?',
              'Cual es mi tasa de ahorro?',
              'Cuales son mis budgets activos?',
            ].map((q) => (
              <button key={q} className="suggestion-btn" onClick={() => setInput(q)}>{q}</button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
