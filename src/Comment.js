import React, { useEffect, useState } from "react";
import "./Comment.css";
import { db } from "./firebase";
import firebase from "firebase";
import DeleteIcon from "@material-ui/icons/Delete";
import { IconButton } from "@material-ui/core";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import FavoriteIcon from "@material-ui/icons/Favorite";

function Comment({
  commentId,
  postId,
  curUserName,
  username,
  text,
  setLoginOpen,
}) {
  const [liked, setLiked] = useState();
  const [likes, setLikes] = useState(0);
  useEffect(() => {
    db.collection("posts")
      .doc(postId)
      .collection("comments")
      .doc(commentId)
      .collection("likes")
      .onSnapshot((snapshot) => {
        setLikes(snapshot.docs.length);
      });
  }, []);
  useEffect(() => {
    //see if the curUserhas liked the comment
    /*     console.log(
      "comment reloaded with comment id ",
      commentId,
      " and postId ",
      postId
    ); */
    if (curUserName) {
      db.collection("posts")
        .doc(postId)
        .collection("comments")
        .doc(commentId)
        .collection("likes")
        .doc(curUserName)
        .get()
        .then((doc) => {
          if (doc.exists) {
            setLiked(true);
          } else {
            setLiked(false);
          }
        });
    } else {
      setLiked(false);
    }
  }, [curUserName]);
  const handleLike = (e) => {
    e.preventDefault();
    if (liked != null) {
      if (liked) {
        db.collection("posts")
          .doc(postId)
          .collection("comments")
          .doc(commentId)
          .collection("likes")
          .doc(curUserName)
          .delete();
        db.collection("posts")
          .doc(postId)
          .collection("comments")
          .doc(commentId)
          .update({ likesNo: firebase.firestore.FieldValue.increment(-1) });

        setLiked(false);
      } else if (curUserName) {
        db.collection("posts")
          .doc(postId)
          .collection("comments")
          .doc(commentId)
          .collection("likes")
          .doc(curUserName)
          .set({ liked: true });
        db.collection("posts")
          .doc(postId)
          .collection("comments")
          .doc(commentId)
          .update({ likesNo: firebase.firestore.FieldValue.increment(1) });
        setLiked(true);
      } else {
        setLoginOpen(true);
      }
    }
  };
  return (
    <div className="comment" key="comment.id">
      <div>
        <b>{username}</b> {text}
      </div>
      <IconButton onClick={handleLike}>
        {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
      </IconButton>
      {likes > 0 ? <div>{likes}</div> : <></>}
      {curUserName === username ? (
        <IconButton
          color="primary"
          aria-label="upload picture"
          component="span"
          className="delete-comment"
          onClick={() => {
            db.collection("posts")
              .doc(postId)
              .collection("comments")
              .doc(commentId)
              .delete();
          }}
        >
          <DeleteIcon className="delete-icon" />
        </IconButton>
      ) : (
        <></>
      )}
    </div>
  );
}

export default Comment;
