import React, { useEffect, useState } from "react";
import FlipMove from "react-flip-move";
import Post from "./Post";
import { db } from "./firebase";
function PostList({ postIds, curUsername, setLoginOpen }) {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    console.log("Post list has been re rendered");
    if (postIds.length > 0) {
      db.collection("posts")
        .orderBy("timestamp", "desc")
        .get()
        .then((snapshot) => {
          const queryPosts = [];

          snapshot.forEach((doc) => {
            if (postIds.includes(doc.id)) {
              console.log(doc.data());
              queryPosts.push({ id: doc.id, post: doc.data() });
            }
          });
          setPosts(queryPosts);
        });
    } else {
      setPosts([]);
    }
  }, [postIds]);
  return (
    <FlipMove>
      {posts.map(({ id, post }) => {
        return (
          <Post
            key={id}
            postId={id}
            username={post.username}
            caption={post.caption}
            imageUrl={post.imageUrl}
            curUserName={curUsername}
            setLoginOpen={setLoginOpen}
            timestamp={post.timestamp}
          />
        );
      })}
    </FlipMove>
  );
}

export default PostList;
