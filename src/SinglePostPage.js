import React, { useState } from "react";
import Header from "./Header";
import Post from "./Post";

function SinglePostPage(props) {
  const [username, setUsername] = useState();
  const post = {};
  return (
    <div>
      <Header setHomeUserName={() => null} />
      <Post
        postId={props.params.postId}
        username={post.username}
        caption={post.caption}
        imageUrl={post.imageUrl}
        curUserName={username}
      />
    </div>
  );
}

export default SinglePostPage;
