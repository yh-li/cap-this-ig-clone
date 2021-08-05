import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import Header from "./Header";
import Post from "./Post";

function SinglePostPage(props) {
  const [username, setUsername] = useState();
  const [post, setPost] = useState();
  const [postId, setPostId] = useState(props.match.params.postId);
  const [loginOpen, setLoginOpen] = useState(false);
  /*   useEffect(() => {
    console.log("username changed to ", username);
  }, [username]); */
  useEffect(() => {
    console.log("Single Post Page Reloaded.");
    if (postId) {
      db.collection("posts")
        .doc(postId)
        .onSnapshot((doc) => {
          console.log("post refreshed");
          setPost(doc.data());
        });
    }
  }, [postId]);
  useEffect(() => {
    console.log("Username changed to ", username);
  }, [username]);
  useEffect(() => {
    console.log("loginOpen has been reset to ", loginOpen);
  }, [loginOpen]);
  return (
    <div>
      <Header
        key={loginOpen}
        setHomeUserName={setUsername}
        loginOpen={loginOpen}
        setLoginOpen={setLoginOpen}
      />

      {post ? (
        <Post
          postId={postId}
          username={post.username}
          caption={post.caption}
          imageUrl={post.imageUrl}
          curUserName={username}
          setLoginOpen={setLoginOpen}
          timestamp={post.timestamp}
        />
      ) : (
        <></>
      )}
    </div>
  );
}

export default SinglePostPage;
