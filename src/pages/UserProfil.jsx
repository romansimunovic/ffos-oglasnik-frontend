import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";

import { getTypeDetails, getDeptDetails } from "../utils/uiHelpers";


export default function UserProfil() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [objave, setObjave] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const userRes = await axios.get(`/api/users/${id}`);
      setUser(userRes.data);

      const objaveRes = await axios.get(`/api/posts/user/${id}`);
      setObjave(objaveRes.data);
    };
    fetchData();
  }, [id]);

  if (!user) return <div>Učitavanje...</div>;

  return (
    <Box className="page-container">

      {/* -------------------------- */}
      {/* KORISNIČKI HEADER */}
      {/* -------------------------- */}
      <Box className="profile-header">
        <Avatar
          src={user.avatar_url}
          alt={user.username}
          sx={{ width: 90, height: 90 }}
        />
        <Box className="profile-info">
          <Typography variant="h5" className="accent-text">
            {user.username}
          </Typography>
          <Typography variant="body1" className="muted-text">
            {user.bio || "Korisnik nema biografiju."}
          </Typography>
        </Box>
      </Box>

      {/* -------------------------- */}
      {/* LISTA OBJAVA */}
      {/* -------------------------- */}
      <Typography variant="h6" className="section-title" sx={{ mt: 4, mb: 2 }}>
        Objave korisnika
      </Typography>

      <Box className="posts-list">
        {objave.length === 0 && (
          <Typography variant="body2" className="muted-text">
            Korisnik još nema objava.
          </Typography>
        )}

        {objave.map((objava) => {
          const tip = getTypeDetails(objava.type);
          const odsjek = getDeptDetails(objava.dept);

          return (
            <Link
              key={objava.id}
              to={`/objava/${objava.id}`}
              className="post-card-link"
            >
              <Box className="post-card">

                {/* Naslov */}
                <Typography variant="h6" className="post-title">
                  {objava.title}
                </Typography>

                {/* Chip meta */}
                <Box className="chip-row">
                  <Chip
                    label={tip.label}
                    icon={tip.icon}
                    size="small"
                    className="chip-type"
                  />
                  <Chip
                    label={odsjek.label}
                    icon={odsjek.icon}
                    size="small"
                    className="chip-dept"
                  />
                  <Chip
                    label={new Date(objava.created_at).toLocaleDateString()}
                    size="small"
                    className="chip-date"
                  />
                </Box>

                {/* Kratki preview sadržaja */}
                <Typography
                  variant="body2"
                  className="post-preview"
                >
                  {objava.content.length > 150
                    ? objava.content.slice(0, 150) + "..."
                    : objava.content}
                </Typography>

                {/* Footer: views + saves */}
                <Box className="post-card-footer">
                  <Box className="post-meta">
                    <VisibilityOutlinedIcon className="meta-icon" />
                    <span>{objava.views}</span>
                  </Box>

                  <Box className="post-meta">
                    <BookmarkBorderOutlinedIcon className="meta-icon" />
                    <span>{objava.saves}</span>
                  </Box>
                </Box>

              </Box>
            </Link>
          );
        })}
      </Box>
    </Box>
  );
}
