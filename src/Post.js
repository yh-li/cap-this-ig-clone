import React, { useState, useEffect, forwardRef } from "react";
import "./Post.css";
import Avatar from "@material-ui/core/Avatar";
import { db } from "./firebase";
import DeleteIcon from "@material-ui/icons/Delete";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import FavoriteIcon from "@material-ui/icons/Favorite";
import ChatBubbleOutlineIcon from "@material-ui/icons/ChatBubbleOutline";
import ShareIcon from "@material-ui/icons/Share";
import BookmarkBorderIcon from "@material-ui/icons/BookmarkBorder";
import BookmarkIcon from "@material-ui/icons/Bookmark";
import { IconButton } from "@material-ui/core";
import Comment from "./Comment";

const Post = forwardRef(
  ({ user, username, postId, imageUrl, caption, curUser }, ref) => {
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState("");
    const [avatar, setAvatar] = useState("/static/images/avatar/1.jpg");
    useEffect(() => {
      db.collection("avatars")
        .doc(username)
        .collection("avatarUrls")
        .orderBy("timestamp", "desc")
        .onSnapshot((querySnapshot) => {
          if (!querySnapshot.empty) {
            setAvatar(querySnapshot.docs[0].data().avatarUrl);
          } else {
            console.log("No avatar");
          }
        });

      //console.log(avatar);
    }, []);
    useEffect(() => {
      let unsubscribe;
      if (postId) {
        unsubscribe = db
          .collection("posts") //accessing posts
          .doc(postId) //going to that specific postId document
          .collection("comments") //going inside its comments collection
          .onSnapshot((snapshot) => {
            setComments(
              snapshot.docs.map((doc) => ({
                id: doc.id,
                comment: doc.data(),
              }))
            );
          }); //this on snapchat means anytime there's a new comment added
        //there's the listener to this specific post
      }

      return () => {
        unsubscribe();
      };
    }, [postId]);

    const postComment = (e) => {
      e.preventDefault();

      db.collection("posts").doc(postId).collection("comments").add({
        text: comment,
        username: user.displayName,
      });
      setComment("");
    };

    return (
      <div className="post" ref={ref}>
        <div className="post__header">
          <div className="post__meta">
            <Avatar className="post__avatar" alt={username} src={avatar} />
            <h3>{username}</h3>
          </div>
          <div className="post__option">
            {curUser && curUser?.displayName === username ? (
              <IconButton
                color="primary"
                aria-label="upload picture"
                component="span"
                className="post__delete"
                onClick={() => {
                  db.collection("posts").doc(postId).delete();
                }}
              >
                <DeleteIcon style={{ fontSize: 20 }} className="delete-icon" />
              </IconButton>
            ) : (
              <></>
            )}
          </div>
        </div>
        {imageUrl ? (
          imageUrl.trim() === "" ? (
            <></>
          ) : (
            <img className="post__image" src={imageUrl} alt="post" />
          )
        ) : (
          <></>
        )}
        {caption ? (
          <h4 className="post__text">
            {username} <span className="post__caption">{caption}</span>
          </h4>
        ) : (
          <></>
        )}
        <div className="post__button__row">
          <div className="post__button__row__left">
            <IconButton>
              <FavoriteBorderIcon />
            </IconButton>
            <IconButton>
              <ChatBubbleOutlineIcon />
            </IconButton>
            <IconButton>
              <ShareIcon />
            </IconButton>
          </div>
          <div className="post__button__row__left">
            <IconButton>
              <BookmarkBorderIcon />
            </IconButton>
          </div>
        </div>
        <div className="post__comments">
          {comments.map(({ id, comment }) => {
            console.log(id);
            console.log(comment.username);
            return (
              <Comment
                key={id}
                commentId={id}
                postId={postId}
                curUser={curUser}
                username={comment.username}
                text={comment.text}
              />
            );
          })}
        </div>

        {user && (
          <form className="post__commentBox">
            <input
              className="post__input"
              type="text"
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <button
              disabled={!comment}
              className="post__button"
              type="submit"
              onClick={postComment}
            >
              Post
            </button>
          </form>
        )}
      </div>
    );
  }
);

export default Post;
