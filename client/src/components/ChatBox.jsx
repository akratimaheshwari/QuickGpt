import React, { useEffect, useRef, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import Message from './Message'
import toast from 'react-hot-toast'

const ChatBox = () => {
  const containerRef = useRef(null)

  const { selectedChat, theme,user,axios,token,setUser,setChats,setSelectedChat } = useAppContext()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [mode, setMode] = useState('text')
  const [isPublished, setIsPublished] = useState(false)

const onSubmit = async (e) => {
  e.preventDefault();
  if (!user) return toast.error("Login to send message");
  if (!prompt.trim()) return;

  try {
    setLoading(true);
    const promptCopy = prompt;
    setPrompt("");

    // If no chat selected, create a new one via backend
    if (!selectedChat) {
      const { data } = await axios.get("/api/chat/create", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        // Refresh chats list in context
        await fetchUserChats();
        // Select the latest chat
        const latestChat = data.chat || chats[0];
        setSelectedChat(latestChat);
      } else {
        toast.error(data.message);
        setPrompt(promptCopy);
        setLoading(false);
        return;
      }
    }

    // Add user message locally immediately
    setMessages((prev) => [
      ...prev,
      { role: "user", content: promptCopy, timestamp: Date.now(), isImage: false },
    ]);

    // Send message to backend
    const { data } = await axios.post(
      `/api/message/${mode}`,
      { chatId: selectedChat._id, prompt: promptCopy, isPublished },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (data.success) {
      // Add reply from backend
      setMessages((prev) => [...prev, data.reply]);

      // Decrease user credits
      setUser((prev) => ({
        ...prev,
        credits: prev.credits - (mode === "image" ? 2 : 1),
      }));
    } else {
      toast.error(data.message);
      setPrompt(promptCopy);
    }
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    setPrompt(prompt);
  } finally {
    setLoading(false);
  }
};


  // Ensure messages is ALWAYS an array
  useEffect(() => {
    if (!selectedChat) {
      setMessages([])
      return
    }

    const msgs = selectedChat?.messages
    if (Array.isArray(msgs)) setMessages(msgs)
    else if (msgs == null) setMessages([])
    else {
      // If messages is a single object (rare), convert to array safely
      setMessages([msgs])
    }
  }, [selectedChat])

  // Auto-scroll when messages or loading changes
  useEffect(() => {
    if (containerRef.current) {
      // more reliable than scrollTo in some layouts
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages, loading])

  const msgsToRender = Array.isArray(messages) ? messages : []

  return (
    <div className='flex-1 flex flex-col justify-between m-5 md:m-10 xl:mx-30 max-md:mt-14 2xl:pr-40'>
      {/* Messages Section */}
      <div
        ref={containerRef}
        className='flex-1 mb-5 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600'
      >
        {msgsToRender.length === 0 ? (
          <div className='h-full flex flex-col items-center justify-center gap-2 text-primary'>
            <img
              src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark}
              alt=''
              className='w-full max-w-56 sm:max-w-68'
            />
            <p className='mt-5 text-4xl sm:text-6xl text-center text-gray-400 dark:text-white'>
              Ask me anything
            </p>
          </div>
        ) : (
          msgsToRender.map((message, index) => (
            <Message key={message?._id ?? index} message={message} />
          ))
        )}

        {/* Typing Loader */}
        {loading && (
          <div className='loader flex items-center gap-1.5 mt-2'>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'></div>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'></div>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'></div>
          </div>
        )}
      </div>

      {/* Publish Image Option */}
      {mode === 'image' && (
        <label className='inline-flex items-center gap-2 mb-3 text-sm mx-auto'>
          <p className='text-xs'>Publish Generated Image to Community</p>
          <input
            type='checkbox'
            className='cursor-pointer'
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
        </label>
      )}

      {/* Prompt Input Box */}
      <form
        onSubmit={onSubmit}
        className='bg-primary/20 dark:bg-[#583C79]/30 border border-primary dark:border-[#80609F]/30 rounded-full w-full max-w-2xl p-3 pl-4 mx-auto flex gap-4 items-center'
      >
        <select
          onChange={(e) => setMode(e.target.value)}
          value={mode}
          className='text-sm pl-3 pr-2 outline-none'
        >
          <option className='dark:bg-purple-900' value='text'>Text</option>
          <option className='dark:bg-purple-900' value='image'>Image</option>
        </select>

        <input
          onChange={(e) => setPrompt(e.target.value)}
          value={prompt}
          type='text'
          placeholder='Type your prompt here...'
          className='flex-1 w-full text-sm outline-none'
          required
        />

        <button disabled={loading}>
          <img
            src={loading ? assets.stop_icon : assets.send_icon}
            className='w-8 cursor-pointer'
            alt=''
          />
        </button>
      </form>
    </div>
  )
}

export default ChatBox
