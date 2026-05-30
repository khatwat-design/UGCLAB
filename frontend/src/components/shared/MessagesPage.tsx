'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { Search, Send, MessageSquare, User, ChevronLeft } from 'lucide-react';
import { MessagesSkeleton } from '@/components/shared/Skeleton';

export default function MessagesPage() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/messages').then((r) => {
      const data = r.data || [];
      setConversations(data);
      const userId = searchParams.get('userId');
      if (userId) {
        const found = data.find((c: any) => String(c.user.id) === userId);
        if (found) {
          setSelectedUser(found.user);
          api.get(`/messages/conversation/${found.user.id}`)
            .then((res) => setMessages(res.data || []))
            .catch(() => setMessages([]));
        } else {
          // No existing conversation — fetch user info to start new one
          api.get(`/auth/me`).then((me) => {
            // Fetch the other user's info
            return api.get(`/creators/${userId}`);
          }).then((res) => {
            setSelectedUser(res.data);
            setMessages([]);
          }).catch(() => {});
        }
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openConversation = async (otherUser: any) => {
    setSelectedUser(otherUser);
    try {
      const res = await api.get(`/messages/conversation/${otherUser.id}`);
      setMessages(res.data || []);
    } catch {
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;
    try {
      const res = await api.post('/messages', {
        receiver_id: selectedUser.id,
        content: newMessage,
      });
      setMessages((prev) => [...prev, res.data]);
      setNewMessage('');
      // Move conversation to top
      setConversations((prev) => {
        const updated = prev.filter((c) => c.user.id !== selectedUser.id);
        return [{ user: selectedUser, last_message: res.data, unread_count: 0 }, ...updated];
      });
    } catch { toast.error('حدث خطأ'); }
  };

  const filteredConversations = conversations.filter((conv: any) =>
    !search || conv.user.name.includes(search)
  );

  if (loading) {
    return <MessagesSkeleton />;
  }

  return (
    <div className="flex h-[calc(100vh-180px)] gap-0 bg-white rounded-xl border border-gray-200 overflow-hidden">
      <Toaster position="top-center" />

      <div className={`w-full sm:w-80 border-l border-gray-200 flex flex-col ${selectedUser ? 'hidden sm:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-bold text-black mb-3">الرسائل</h2>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن محادثة..."
              className="pr-9 pl-3 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50 w-full focus:bg-white focus:border-black outline-none transition-all"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv: any) => {
              const isActive = selectedUser?.id === conv.user.id;
              return (
                <button
                  key={conv.user.id}
                  onClick={() => openConversation(conv.user)}
                  className={`w-full text-right p-4 hover:bg-gray-50 transition-all ${
                    isActive ? 'bg-gray-50 border-r-2 border-black' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {conv.user.avatar ? (
                      <img src={conv.user.avatar} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-sm font-bold text-white shrink-0">
                        {conv.user.name?.[0] || '?'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-black truncate">{conv.user.name}</p>
                        {conv.last_message?.created_at && (
                          <p className="text-[10px] text-gray-400 shrink-0">
                            {formatDate(conv.last_message.created_at)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-400 truncate flex-1 text-right">
                          {conv.last_message?.content || 'لا توجد رسائل'}
                        </p>
                        {conv.unread_count > 0 && (
                          <span className="shrink-0 bg-black text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <MessageSquare className="w-8 h-8 text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">لا توجد رسائل</p>
              <p className="text-xs text-gray-300 mt-1">عند التواصل مع المبدعين ستظهر المحادثات هنا</p>
            </div>
          )}
        </div>
      </div>

      <div className={`flex-1 flex flex-col ${!selectedUser ? 'hidden sm:flex' : 'flex'}`}>
        {selectedUser ? (
          <>
            <div className="flex items-center gap-3 p-4 border-b border-gray-100">
              <button
                onClick={() => setSelectedUser(null)}
                className="sm:hidden text-gray-400 hover:text-black transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {selectedUser.avatar ? (
                <img src={selectedUser.avatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-sm font-bold text-white shrink-0">
                  {selectedUser.name?.[0] || '?'}
                </div>
              )}
              <div>
                <p className="font-bold text-sm text-black">{selectedUser.name}</p>
                <p className="text-xs text-gray-400">{selectedUser.creator_profile?.category || 'مبدع'}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollBehavior: 'smooth' }}>
              {messages.length > 0 ? (
                messages.map((msg: any, i: number) => {
                  const isMine = msg.sender_id === user?.id;
                  const showAvatar = i === 0 || messages[i - 1]?.sender_id !== msg.sender_id;
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-2 ${isMine ? 'justify-start' : 'justify-end'}`}
                    >
                      {!isMine && showAvatar && (
                        selectedUser.avatar ? (
                          <img src={selectedUser.avatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0 mt-1" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-1">
                            {selectedUser.name?.[0] || '?'}
                          </div>
                        )
                      )}
                      {!isMine && !showAvatar && <div className="w-7 shrink-0" />}
                      <div className={`max-w-[75%] ${isMine ? 'order-1' : 'order-2'}`}>
                        <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isMine ? 'bg-gray-100 text-gray-900 rounded-tr-sm' : 'bg-black text-white rounded-tl-sm'
                        }`}>
                          <p>{msg.content}</p>
                        </div>
                        <p className={`text-[10px] mt-1 ${isMine ? 'text-gray-400 text-right' : 'text-gray-400 text-right'}`}>
                          {formatDate(msg.created_at)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-gray-400">
                  <p>لا توجد رسائل في هذه المحادثة</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-100">
              <div className="flex gap-3 items-end">
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-all disabled:opacity-30 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:border-black outline-none transition-all"
                    placeholder="اكتب رسالتك..."
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 text-gray-400 px-4">
            <MessageSquare className="w-12 h-12 text-gray-200 mb-3" />
            <p className="text-sm font-medium text-gray-500">اختر محادثة للبدء</p>
            <p className="text-xs text-gray-300 mt-1">من القائمة الجانبية اختر المحادثة التي تريد متابعتها</p>
          </div>
        )}
      </div>
    </div>
  );
}
