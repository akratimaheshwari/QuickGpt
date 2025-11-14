import { useContext,useState,createContext, useEffect} from "react"
import { useNavigate } from "react-router-dom"
import { dummyChats, dummyUserData } from "../assets/assets"

export const AppContext = createContext()

export const AppContextProvider = ({ children })=>{
    const navigate = useNavigate()
    const [user,setUser] = useState(null);
    const [chats,setChats] = useState([]);
    const [selectedChat,setSelectedChats] = useState(null);
    const [theme,setTheme] = useState(localStorage.getItem('theme')||'light');

    const fetchUser = async()=>{
        setUser(dummyUserData)
        setSelectedChats()
    };

    const fetchUserChats = async()=>{
        setChats(dummyChats)
        setSelectedChats(dummyChats[0])
    };

    useEffect(()=>{
        if(user){
            fetchUserChats()
        }
        else{
            setChats([])
            setSelectedChats(null)
        }
    },[user])

    useEffect(()=>{
        if(theme === 'dark'){
            document.documentElement.classList.add('dark');
        }
        else{
            document.documentElement.classList.remove('dark')
        }
        localStorage.setItem("theme", theme);
    },[theme])

    useEffect(()=>{
        fetchUser()
    },[])

    const value = {
        navigate,user,setUser,fetchUser,chats,setChats,selectedChat,setSelectedChats,theme,setTheme
    }

    return(
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}
export const useAppContext = () => useContext(AppContext);