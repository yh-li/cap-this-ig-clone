import React from "react";
import "./Comment.css";
import { db } from "./firebase";
import DeleteIcon from "@material-ui/icons/Delete";
import { IconButton } from "@material-ui/core";

function Comment({ commentId, postId, curUserName, username, text }) {
  return (
    <div className="comment" key="comment.id">
      <div>
        <b>{username}</b> {text}
      </div>

      {curUserName === username ? (
        <IconButton
          color="primary"
          aria-label="upload picture"
          component="span"
          className="delete-comment"
        >
          <DeleteIcon
            className="delete-icon"
            onClick={() => {
              db.collection("posts")
                .doc(postId)
                .collection("comments")
                .doc(commentId)
                .delete()
                .then(console.log(commentId));
            }}
          />
        </IconButton>
      ) : (
        <></>
      )}
    </div>
  );
}

export default Comment;
