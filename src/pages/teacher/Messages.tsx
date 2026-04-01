import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PortalLayout from "@/components/PortalLayout";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import {
  Send,
  Loader2,
  Search,
  MessageSquare,
  Plus,
  ArrowLeft,
  Check,
  CheckCheck,
  Paperclip,
  Image as ImageIcon,
  FileText,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Parent {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  children: string[];
}

interface ConversationItem {
  partner: { id: string; name: string; avatar_url?: string; role: string };
  lastMessage: { message: string; created_at: string; sender_id: string };
  unreadCount: number;
}

interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  file_url?: string;
  file_type?: string;
  read_status: boolean;
  created_at: string;
}

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [selectedParent, setSelectedParent] = useState<string | null>(null);
  const [selectedParentName, setSelectedParentName] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    fetchConversations();
    fetchParents();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, otherUserTyping]);

  useEffect(() => {
    if (!user?.id) return;
    const messageSub = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          if (newMsg.sender_id === selectedParent) {
            setChatMessages((prev) => [...prev, newMsg]);
            api.put(`/teacher/messages/${newMsg.id}/read`).catch(console.error);
          } else {
            fetchConversations();
          }
        }
      ).subscribe();
    return () => { supabase.removeChannel(messageSub); };
  }, [user?.id, selectedParent]);

  useEffect(() => {
    if (!selectedParent || !user) return;
    const channelName = `chat:${[user.id, selectedParent].sort().join('-')}`;
    const channel = supabase.channel(channelName);
    channel.on('broadcast', { event: 'typing' }, ({ payload }) => {
      if (payload.userId === selectedParent) setOtherUserTyping(payload.typing);
    }).subscribe();
    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [selectedParent, user]);

  const fetchConversations = async () => {
    try {
      const { data } = await api.get("/teacher/messages");
      setConversations(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchParents = async () => {
    try {
      const { data } = await api.get("/teacher/messages/parents");
      setParents(data);
    } catch (err) { console.error(err); }
  };

  const openConversation = async (parentId: string, parentName: string) => {
    setSelectedParent(parentId);
    setSelectedParentName(parentName);
    setMobileShowChat(true);
    setChatLoading(true);
    setShowNewChat(false);
    setChatMessages([]);
    try {
      const { data } = await api.get(`/teacher/messages/${parentId}`);
      setChatMessages(data);
      fetchConversations();
    } catch (err) { console.error(err); } finally { setChatLoading(false); }
  };

  const handleTyping = () => {
    if (!channelRef.current || !user) return;
    if (!isTyping) {
      setIsTyping(true);
      channelRef.current.send({ type: 'broadcast', event: 'typing', payload: { userId: user.id, typing: true } });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      channelRef.current.send({ type: 'broadcast', event: 'typing', payload: { userId: user.id, typing: false } });
    }, 2000);
  };

  const handleSend = async () => {
    if ((!newMessage.trim() && !attachedFile) || !selectedParent) return;
    setSending(true);
    let fileUrl = "";
    let fileType = "";
    try {
      if (attachedFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", attachedFile);
        const uploadRes = await api.post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
        fileUrl = uploadRes.data.url;
        fileType = attachedFile.type.startsWith("image/") ? "image" : "pdf";
      }
      const { data } = await api.post("/teacher/messages", { receiver_id: selectedParent, message: newMessage.trim(), file_url: fileUrl, file_type: fileType });
      setChatMessages((prev) => [...prev, data]);
      setNewMessage("");
      setAttachedFile(null);
      fetchConversations();
      if (isTyping) {
        setIsTyping(false);
        channelRef.current.send({ type: 'broadcast', event: 'typing', payload: { userId: user?.id, typing: false } });
      }
    } catch (err) { toast.error("Failed to send"); } finally { setSending(false); setUploading(false); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 5 * 1024 * 1024) setAttachedFile(file);
    else if (file) toast.error("File too large (>5MB)");
  };

  const filteredParents = parents.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.children.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())));

  return (
    <PortalLayout type="teacher">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-[calc(100vh-180px)]">
        <div className="flex flex-col md:flex-row h-full border rounded-xl overflow-hidden bg-white shadow-sm font-sans">
          {/* Sidebar */}
          <div className={`w-full md:w-80 lg:w-96 border-r flex flex-col ${mobileShowChat ? "hidden md:flex" : "flex"}`}>
            <div className="p-4 border-b bg-gray-50/50">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-800">Parent Contacts</h2>
                <Button size="sm" variant="outline" className="h-8 gap-1 bg-white" onClick={() => setShowNewChat(!showNewChat)}>
                  <Plus size={14} /> New Chat
                </Button>
              </div>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search parents or students..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-white outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {showNewChat && (
                <div className="p-3 border-b bg-blue-50/20">
                  <p className="text-[10px] font-bold text-blue-600 mb-2 px-1 uppercase tracking-wider">Parents of your students</p>
                  {filteredParents.map((p) => (
                    <button key={p.id} onClick={() => openConversation(p.id, p.name)} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-all text-left group">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">{p.name.charAt(0)}</div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-800 truncate">{p.name}</div>
                        <div className="text-[10px] text-gray-500 truncate">Parent of: {p.children.join(", ")}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {loading ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-blue-600" /></div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400"><MessageSquare size={40} className="mb-3 opacity-10" /><p className="text-sm">No recent conversations</p></div>
              ) : (
                conversations.map((conv, i) => (
                  <button key={i} onClick={() => openConversation(conv.partner.id, conv.partner.name)} className={`w-full flex items-center gap-3 p-4 border-b hover:bg-gray-50 transition-colors text-left ${selectedParent === conv.partner.id ? "bg-blue-50 border-l-4 border-l-blue-600" : ""}`}>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm">{conv.partner.name.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5"><span className="font-semibold text-sm text-gray-900 truncate">{conv.partner.name}</span><span className="text-[10px] text-gray-500">{(new Date(conv.lastMessage.created_at)).toLocaleDateString()}</span></div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-500 truncate flex-1">{conv.lastMessage.message || "Attachment"}</p>
                        {conv.unreadCount > 0 && <Badge className="bg-blue-600 text-[10px] min-w-[18px] h-[18px] flex items-center justify-center p-0 rounded-full">{conv.unreadCount}</Badge>}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className={`flex-1 flex flex-col ${!mobileShowChat ? "hidden md:flex" : "flex"} bg-gray-50/30`}>
            {selectedParent ? (
              <>
                <div className="p-4 border-b flex items-center gap-3 bg-white shadow-sm z-10">
                  <button className="md:hidden" onClick={() => setMobileShowChat(false)}><ArrowLeft size={18} /></button>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-sm font-bold shadow-sm">{selectedParentName.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-gray-900">{selectedParentName}</div>
                    <div className="text-[10px] text-gray-500 truncate">Parent Communication</div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatLoading ? (
                    <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-blue-600" /></div>
                  ) : (
                    <>
                      {chatMessages.map((msg) => {
                        const isMine = msg.sender_id === user?.id;
                        return (
                          <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[75%] rounded-2xl p-3 px-4 ${isMine ? "bg-blue-600 text-white shadow-md rounded-tr-none" : "bg-white border border-gray-100 rounded-tl-none shadow-sm"}`}>
                              {msg.file_url && (
                                <div className="mb-2">
                                  {msg.file_type === "image" ? (
                                    <img src={msg.file_url} alt="Attachment" className="rounded-lg max-h-60 w-full object-cover border border-black/5 cursor-pointer hover:opacity-95 transition-opacity" onClick={() => window.open(msg.file_url)} />
                                  ) : (
                                    <a href={msg.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 bg-black/5 rounded-lg text-xs font-medium no-underline text-inherit"><FileText size={16} /> <span>Document.pdf</span></a>
                                  )}
                                </div>
                              )}
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                              <div className={`flex items-center gap-1 mt-1.5 ${isMine ? "justify-end text-blue-100" : "text-gray-400"} text-[9px] font-medium uppercase`}>
                                {(new Date(msg.created_at)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {isMine && (msg.read_status ? <CheckCheck size={10} /> : <Check size={10} />)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {otherUserTyping && (
                        <div className="flex justify-start">
                          <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-bounce" />
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-bounce [animation-delay:0.2s]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-bounce [animation-delay:0.4s]" />
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </>
                  )}
                </div>

                <div className="p-4 border-t bg-white">
                  <AnimatePresence>
                    {attachedFile && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="pb-3 flex gap-2">
                        <div className="relative group p-2 border border-blue-100 rounded-lg bg-blue-50/50 flex items-center gap-2 pr-8">
                          {attachedFile.type.startsWith("image/") ? <ImageIcon size={16} className="text-blue-600" /> : <FileText size={16} className="text-blue-600" />}
                          <span className="text-[11px] font-medium text-blue-800 truncate max-w-[150px]">{attachedFile.name}</span>
                          <button onClick={() => setAttachedFile(null)} className="absolute right-1.5 top-1.5 p-0.5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"><X size={10} /></button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="flex items-center gap-2">
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*,.pdf" />
                    <Button variant="ghost" size="icon" className="rounded-full shrink-0 text-gray-500 hover:bg-gray-100 h-10 w-10" onClick={() => fileInputRef.current?.click()}><Paperclip size={20} /></Button>
                    <input type="text" className="flex-1 bg-gray-100/80 border-none rounded-full px-5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-gray-400" placeholder="Type a response..." value={newMessage} onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()} />
                    <Button size="icon" className="rounded-full shrink-0 h-10 w-10 bg-blue-600 hover:bg-blue-700 shadow-md transition-transform active:scale-95" onClick={handleSend} disabled={sending || uploading || (!newMessage.trim() && !attachedFile)}>
                      {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-500">
                <div className="w-16 h-16 rounded-3xl bg-blue-50 flex items-center justify-center mb-5 rotate-12"><MessageSquare size={32} className="text-blue-500 -rotate-12" /></div>
                <h3 className="text-lg font-bold text-gray-800">Communication Center</h3>
                <p className="text-sm text-gray-500 max-w-xs mt-2 leading-relaxed">Select a parent from the left to start a conversation regarding student performance or school activities.</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </PortalLayout>
  );
};

export default Messages;
