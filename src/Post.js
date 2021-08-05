import React, { useState, useEffect, forwardRef } from "react";
import "./Post.css";
import Avatar from "@material-ui/core/Avatar";
import { db } from "./firebase";
import firebase from "firebase";
import DeleteIcon from "@material-ui/icons/Delete";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import FavoriteIcon from "@material-ui/icons/Favorite";
import ChatBubbleOutlineIcon from "@material-ui/icons/ChatBubbleOutline";
import ShareIcon from "@material-ui/icons/Share";
import BookmarkBorderIcon from "@material-ui/icons/BookmarkBorder";
import { IconButton } from "@material-ui/core";
import Comment from "./Comment";
import { Link, useHistory } from "react-router-dom";
import Moment from "react-moment";

const Post = forwardRef(
  (
    {
      username,
      postId,
      imageUrl,
      caption,
      curUserName,
      setLoginOpen,
      timestamp,
    },
    ref
  ) => {
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState("");
    const [avatar, setAvatar] = useState("/static/images/avatar/1.jpg");
    const [liked, setLiked] = useState();
    const [likedBy, setLikedBy] = useState();
    const history = useHistory();
    useEffect(() => {
      console.log("Post Reloaded");
      db.collection("avatars")
        .doc(username)
        .collection("avatarUrls")
        .orderBy("timestamp", "desc")
        .onSnapshot((querySnapshot) => {
          if (!querySnapshot.empty) {
            setAvatar(querySnapshot.docs[0].data().avatarUrl);
          } else {
            console.log("No avatar and this is from Post!!!!!");
          }
        });
      if (curUserName) {
        db.collection("posts")
          .doc(postId)
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
      db.collection("posts")
        .doc(postId)
        .collection("likes")
        .onSnapshot((querySnapshot) => {
          setLikedBy(querySnapshot.docs.length);
        });
    }, []);

    useEffect(() => {
      console.log("Post ID changed");
      let unsubscribe;
      if (postId) {
        unsubscribe = db
          .collection("posts") //accessing posts
          .doc(postId) //going to that specific postId document
          .collection("comments") //going inside its comments collection
          .onSnapshot((snapshot) => {
            const orderedComments = [];
            snapshot.docs.map((doc) => {
              orderedComments.push({ id: doc.id, comment: doc.data() });
            });
            orderedComments.sort((comment1, comment2) => {
              if (comment2.comment.likesNo !== comment1.comment.likesNo) {
                return comment2.comment.likesNo - comment1.comment.likesNo;
              } else if (
                comment1.comment.timestamp &&
                comment2.comment.timestamp
              ) {
                return (
                  comment1.comment.timestamp.seconds -
                  comment2.comment.timestamp.seconds
                );
              } else if (comment1.comment.timestamp) {
                return -1;
              } else {
                return 1;
              }
            });
            setComments(orderedComments);
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
        username: curUserName,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        likesNo: 0,
      });
      setComment("");
    };

    const handleLike = (e) => {
      e.preventDefault();
      if (liked != null) {
        if (liked) {
          db.collection("posts")
            .doc(postId)
            .collection("likes")
            .doc(curUserName)
            .delete();
          setLiked(false);
        } else if (curUserName) {
          db.collection("posts")
            .doc(postId)
            .collection("likes")
            .doc(curUserName)
            .set({ liked: true });
          setLiked(true);
        } else {
          setLoginOpen(true);
        }
      }
    };
    const handleComment = (e) => {
      e.preventDefault();
      if (curUserName) {
        history.push(`/posts/${postId}`);
      } else {
        setLoginOpen(true);
      }
    };
    useEffect(() => {
      //liked needs to be reset
      if (curUserName) {
        db.collection("posts")
          .doc(postId)
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
    return (
      <div className="post" ref={ref}>
        <div className="post__header">
          <div className="post__meta">
            <Link to={`/users/${username}`}>
              <Avatar className="post__avatar" alt={username} src={avatar} />
            </Link>
            <Link
              to={`/users/${username}`}
              style={{ color: "inherit", textDecoration: "none" }}
            >
              <h3>{username}</h3>
            </Link>
          </div>
          <div className="post__option">
            {curUserName && curUserName === username ? (
              <IconButton
                color="primary"
                aria-label="upload picture"
                component="span"
                className="post__delete"
                onClick={() => {
                  db.collection("posts")
                    .doc(postId)
                    .collection("comments")
                    .onSnapshot((snapshot) => {
                      snapshot.docs.map((doc) => {
                        doc.ref.delete();
                      });
                    });
                  db.collection("posts").doc(postId).delete();
                  db.collection("users")
                    .doc(username)
                    .collection("postIds")
                    .doc(postId)
                    .delete()
                    .then(() => {
                      console.log(
                        "Deletion Done with postId ",
                        postId,
                        " from user ",
                        username
                      );
                    });
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
            <Link
              to={`/users/${username}`}
              style={{ color: "inherit", textDecoration: "none" }}
            >
              {username}
            </Link>{" "}
            <span className="post__caption">{caption}</span>
          </h4>
        ) : (
          <></>
        )}
        <div className="post__button__row">
          <div className="post__button__row__left">
            <IconButton onClick={handleLike}>
              {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
            <IconButton onClick={handleComment}>
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
        {likedBy > 0 ? (
          <div className="post__liked_by">Liked by {likedBy}</div>
        ) : (
          <></>
        )}
        <div className="post__comments">
          {comments.map(({ id, comment }) => {
            return (
              <Comment
                key={id}
                commentId={id}
                postId={postId}
                curUserName={curUserName}
                username={comment.username}
                text={comment.text}
                setLoginOpen={setLoginOpen}
              />
            );
          })}
        </div>
        {timestamp ? (
          <div className="post__timestamp">
            <Moment fromNow unix>
              {timestamp.seconds}
            </Moment>
          </div>
        ) : (
          <></>
        )}
        {curUserName && (
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
