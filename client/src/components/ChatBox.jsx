import React, { useEffect, useRef, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import Message from './Message'
import toast from 'react-hot-toast'

const ChatBox = () => {
  const containerRef = useRef(null)

  const {
    selectedChat,
    theme,
    user,
    axios,
    token,
    setUser,
    setChats,
    setSelectedChat,
    chats
  } = useAppContext()

  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [mode, setMode] = useState('text')
  const [isPublished, setIsPublished] = useState(false)

  // --------------------------------------------------------------
  // Load chat history only when selectedChat changes (CORRECT FIX)
  // --------------------------------------------------------------
  useEffect(() => {
  if (!selectedChat) return

  const fetchMessages = async () => {
    try {
      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (data.success) {
        setMessages(data.messages)
      }
    } catch (error) {
      console.log(error)
    }
  }

  fetchMessages()
}, [selectedChat])

  // Auto-scroll
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages, loading])

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!user) return toast.error("Login to send message")
    if (!prompt.trim()) return

    try {
      setLoading(true)
      const promptCopy = prompt
      setPrompt("")

      let chat = selectedChat

      // Create chat if none exists
      if (!chat) {
        const { data } = await axios.get("/api/chat/create", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!data.success) {
          toast.error(data.message)
          setPrompt(promptCopy)
          setLoading(false)
          return
        }

        setChats(prev => [data.chat, ...prev])
        setSelectedChat(data.chat)
        chat = data.chat
      }

      // --------------------------------------------------------------
      // 1️⃣ SHOW USER MESSAGE IMMEDIATELY
      // --------------------------------------------------------------
      const userMsg = {
        role: "user",
        content: promptCopy,
        timestamp: Date.now(),
        isImage: false
      }

      setMessages(prev => [...prev, userMsg])

      // --------------------------------------------------------------
      // Send message to backend
      // --------------------------------------------------------------
      const { data } = await axios.post(
        `/api/message/${mode}`,
        {
          chatId: chat._id,
          prompt: promptCopy,
          isPublished
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (!data.success) {
        toast.error(data.message)
        setPrompt(promptCopy)
        return
      }

      const botReply = data.reply

      // --------------------------------------------------------------
      // 2️⃣ ADD BOT MESSAGE TO UI
      // --------------------------------------------------------------
      setMessages(prev => [...prev, botReply])

      // --------------------------------------------------------------
      // 3️⃣ UPDATE selectedChat ONCE (IMPORTANT FIX)
      // --------------------------------------------------------------
      setSelectedChat(prev => ({
        ...prev,
        messages: [...(prev?.messages || []), userMsg, botReply]
      }))

      // Reduce user credits
      setUser(prev => ({
        ...prev,
        credits: prev.credits - (mode === "image" ? 2 : 1)
      }))

    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
      setPrompt(prompt)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex-1 flex flex-col justify-between m-5 md:m-10 xl:mx-30 max-md:mt-14 2xl:pr-40'>
      
      {/* Messages Area */}
      <div
        ref={containerRef}
        className='flex-1 mb-5 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600'
      >
        {messages.length === 0 ? (
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
          messages.map((message, index) => (
            <Message key={message?._id ?? index} message={message} />
          ))
        )}

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

      {/* Prompt Input */}
      <form
        onSubmit={onSubmit}
        className='bg-primary/20 dark:bg-[#583C79]/30 border border-primary dark:border-[#80609F]/30 rounded-full w-full max-w-2xl p-3 pl-4 mx-auto flex gap-4 items-center'
      >
        <select
          onChange={(e) => setMode(e.target.value)}
          value={mode}
          className='text-sm pl-3 pr-2 outline-none'
        >
          <option value='text'>Text</option>
          <option value='image'>Image</option>
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
