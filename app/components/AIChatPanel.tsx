'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Drawer,
  Typography,
  TextField,
  IconButton,
  Chip,
  Paper,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Close,
  Send,
  SmartToy,
  Person,
  AutoAwesome
} from '@mui/icons-material';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  surveyResultId: number;
  userInfo: any;
  categoryScores: Record<string, number>;
  totalScore: number;
}

const PRESET_QUESTIONS = [
  '가장 시급한 개선 영역은?',
  '적은 비용으로 빠른 성과를 내려면?',
  '우리 업종에서 중요한 SCM 요소는?',
  '개선 우선순위를 어떻게 정해야 할까?'
];

export default function AIChatPanel({ open, onClose, surveyResultId, userInfo, categoryScores, totalScore }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          surveyResultId,
          message: text,
          userInfo,
          categoryScores,
          totalScore
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.sessionId) setSessionId(data.sessionId);
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.' }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleNewSession = () => {
    setMessages([]);
    setSessionId(null);
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 420 } } }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* 헤더 */}
        <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AutoAwesome sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>AI SCM 코칭</Typography>
          </Box>
          <Box>
            <Chip
              label="새 대화"
              size="small"
              onClick={handleNewSession}
              sx={{ mr: 1, color: 'white', borderColor: 'white' }}
              variant="outlined"
            />
            <IconButton onClick={onClose} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Box>
        </Box>

        {/* 프리셋 질문 */}
        {messages.length === 0 && (
          <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 'bold' }}>
              자주 묻는 질문
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {PRESET_QUESTIONS.map((q, i) => (
                <Chip
                  key={i}
                  label={q}
                  size="small"
                  onClick={() => sendMessage(q)}
                  clickable
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}

        <Divider />

        {/* 메시지 영역 */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {messages.length === 0 && (
            <Box sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
              <SmartToy sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
              <Typography variant="body1">
                안녕하세요! SCM 개선에 대해 무엇이든 질문하세요.
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                귀사의 진단 결과를 바탕으로 맞춤 조언을 드립니다.
              </Typography>
            </Box>
          )}

          {messages.map((msg, index) => (
            <Box key={index} sx={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {msg.role === 'assistant' && (
                <SmartToy sx={{ fontSize: 28, color: 'primary.main', mr: 1, mt: 0.5 }} />
              )}
              <Paper
                sx={{
                  p: 1.5,
                  maxWidth: '80%',
                  bgcolor: msg.role === 'user' ? 'primary.main' : 'grey.100',
                  color: msg.role === 'user' ? 'white' : 'text.primary',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px'
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {msg.content}
                </Typography>
              </Paper>
              {msg.role === 'user' && (
                <Person sx={{ fontSize: 28, color: 'primary.main', ml: 1, mt: 0.5 }} />
              )}
            </Box>
          ))}

          {isLoading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SmartToy sx={{ fontSize: 28, color: 'primary.main' }} />
              <Paper sx={{ p: 1.5, bgcolor: 'grey.100', borderRadius: '16px 16px 16px 4px' }}>
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                  <CircularProgress size={16} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    분석 중...
                  </Typography>
                </Box>
              </Paper>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* 입력 영역 */}
        <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', bgcolor: 'white' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="SCM 개선에 대해 질문하세요..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              multiline
              maxRows={3}
            />
            <IconButton
              color="primary"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
            >
              <Send />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}
