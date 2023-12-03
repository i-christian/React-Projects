import { createContext, useState, useEffect } from 'react';
import {useNavigate} from 'react-router-dom';
import {format} from 'date-fns'
import api from '../api/posts';
import useAxiosFetch from '../hooks/useAxiosFetch';


const DataContext = createContext({});


export const DataProvider = ({ children }) => {
    const [posts, setPosts] = useState([])
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [postTitle, setPostTitle] = useState('');
    const [postBody, setPostBody] = useState('');
    const [editTitle, setEditTitle] = useState('');
    const [editBody, setEditBody] = useState('');
    const navigate = useNavigate();

    // use the custom hook to fetch data
    const {data, fetchError, isLoading} = useAxiosFetch('http://localhost:3500/posts')

    useEffect(
      () => {
        setPosts(data);
      }, [data]
    );

    useEffect(()=>{
        const filterResults = posts?.filter(post => (
            (post.body.toLocaleLowerCase()).includes(search.toLocaleLowerCase()))
            || (post.title.toLocaleLowerCase()).includes(search.toLocaleLowerCase()))
    
            setSearchResults(filterResults.reverse());
    }, [posts, search])

    const handleSubmit = async (e) => {
        e.preventDefault();
        const id = posts.length ? posts[posts.length - 1].id + 1: 1;
        const datetime = format(new Date(), 'MMMM dd, yyyy pp')
        const newPost = {id, title: postTitle, datetime, body: postBody};
         
        try {
          const response = await api.post('/posts', newPost);
          const allPosts = [...posts, response.data];
          setPosts(allPosts);
          setPostTitle('');
          setPostBody('');
          navigate('/');
        }catch (err) {
          console.log(`Error: ${err.message}`)
        }
      }

    const handleEdit = async(id) => {
      const datetime = format(new Date(), 'MMMM dd, yyyy pp')
      const updatedPost = {id, title: editTitle, 
        datetime, body: editBody};

      try{
        const response = await api.put(`/posts/${id}`, updatedPost)
        setPosts( posts?.map(post => post.id === id ? {...response.data} : post ));
        setEditTitle('');
        setEditBody('');
        navigate('/');
      }catch (err) {
        console.log(`Error: ${err.message}`)
      }
    }

    const handleDelete = async (id) => {
      try{
        await api.delete(`/posts/${id}`);
        const postsList = posts.filter(post => post.id !== id);
        setPosts(postsList);
        navigate('/');
      }catch (err) {
        console.log(`Error: ${err.message}`)
      }
    }

    return (
        <DataContext.Provider value={{
            search, setSearch, searchResults,
            fetchError, isLoading, 
            handleSubmit, postTitle, setPostTitle,
            postBody, setPostBody, posts, 
            handleEdit, handleDelete,
            editBody, setEditBody, editTitle, setEditTitle
        }}>
            {children}
        </DataContext.Provider>
    )
}


export default DataContext;