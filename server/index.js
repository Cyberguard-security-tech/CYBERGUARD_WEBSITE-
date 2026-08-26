const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { DatabaseSync } = require("node:sqlite");
const path = require("path");
const fs = require("fs");

const app = express();

const PORT = process.env.PORT || 3000;

/*
 IMPORTANT:
 Change these before putting the website online.
*/
const OWNER_PIN = process.env.CYBERGUARD_ADMIN_PIN;
const JWT_SECRET = process.env.CYBERGUARD_SECRET;

if (!OWNER_PIN || !JWT_SECRET) {
  console.error(
    "CYBERGUARD ERROR: CYBERGUARD_ADMIN_PIN and CYBERGUARD_SECRET must be configured."
  );
  process.exit(1);
}
const ROOT = path.join(__dirname, "..");

const PUBLIC_DIR = path.join(ROOT, "public");

const UPLOAD_DIR = path.join(
  PUBLIC_DIR,
  "uploads"
);

const DATA_DIR = path.join(
  ROOT,
  "data"
);

const DB_FILE = path.join(
  DATA_DIR,
  "cyberguard.db"
);

fs.mkdirSync(UPLOAD_DIR, {
  recursive: true
});

fs.mkdirSync(DATA_DIR, {
  recursive: true
});


/*
 ======================================
 CYBERGUARD SQLITE DATABASE
 ======================================
*/

const db = new DatabaseSync(DB_FILE);

db.exec(`
  CREATE TABLE IF NOT EXISTS content (
    id INTEGER PRIMARY KEY CHECK(id = 1),
    announcement TEXT,
    video_url TEXT
  );

  CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT,
    message TEXT NOT NULL,
    created_at TEXT
  );
`);


/*
 ======================================
 DEFAULT WEBSITE CONTENT
 ======================================
*/

const existingContent = db
  .prepare(
    "SELECT id FROM content WHERE id = 1"
  )
  .get();

if (!existingContent) {
  db.prepare(`
    INSERT INTO content
    (id, announcement, video_url)
    VALUES
    (1, ?, ?)
  `).run(
    "COMING SOON",
    ""
  );
}


/*
 ======================================
 MIDDLEWARE
 ======================================
*/

app.use(cors());

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true
  })
);

app.use(
  "/uploads",
  express.static(UPLOAD_DIR)
);


/*
 ======================================
 VIDEO UPLOAD
 ======================================
*/

const storage = multer.diskStorage({

  destination: function (
    req,
    file,
    callback
  ) {

    callback(
      null,
      UPLOAD_DIR
    );

  },

  filename: function (
    req,
    file,
    callback
  ) {

    const safeName =
      file.originalname
        .replace(
          /[^a-zA-Z0-9._-]/g,
          "_"
        );

    callback(
      null,
      Date.now() +
      "-" +
      safeName
    );

  }

});

const upload = multer({

  storage,

  limits: {
    fileSize:
      500 * 1024 * 1024
  }

});


/*
 ======================================
 OWNER AUTHENTICATION
 ======================================
*/

function authenticateOwner(
  req,
  res,
  next
) {

  try {

    const header =
      req.headers.authorization || "";

    const token =
      header.replace(
        "Bearer ",
        ""
      );

    jwt.verify(
      token,
      JWT_SECRET
    );

    next();

  } catch {

    res.status(401).json({
      error:
        "Owner authentication required."
    });

  }

}


/*
 ======================================
 PUBLIC CONTENT
 ======================================
*/

app.get(
  "/api/content",
  (req, res) => {

    try {

      const content =
        db.prepare(`
          SELECT
            announcement,
            video_url
          FROM content
          WHERE id = 1
        `).get();

      res.json(
        content || {
          announcement: "",
          video_url: ""
        }
      );

    } catch (error) {

      console.error(
        "Content error:",
        error
      );

      res.status(500).json({
        error:
          "Unable to load website content."
      });

    }

  }
);


/*
 ======================================
 PUBLIC FEEDBACK
 ======================================
*/

app.post(
  "/api/feedback",
  (req, res) => {

    try {

      const email =
        String(
          req.body.email || ""
        );

      const message =
        String(
          req.body.message || ""
        ).trim();

      if (!message) {

        return res.status(400).json({
          error:
            "Feedback message is required."
        });

      }

      db.prepare(`
        INSERT INTO feedback
        (email, message, created_at)
        VALUES (?, ?, datetime('now'))
      `).run(
        email,
        message
      );

      res.json({
        message:
          "Thank you. Your feedback was received."
      });

    } catch (error) {

      console.error(
        "Feedback error:",
        error
      );

      res.status(500).json({
        error:
          "Unable to save feedback."
      });

    }

  }
);


/*
 ======================================
 OWNER LOGIN
 ======================================
*/

app.post(
  "/api/admin/login",
  (req, res) => {

    const pin =
      String(
        req.body.pin || ""
      );

    if (
      pin !== OWNER_PIN
    ) {

      return res.status(401).json({
        error:
          "Invalid owner PIN."
      });

    }

    const token =
      jwt.sign(
        {
          role: "owner"
        },
        JWT_SECRET,
        {
          expiresIn: "7d"
        }
      );

    res.json({
      token
    });

  }
);


/*
 ======================================
 OWNER:
 CHANGE WEBSITE CONTENT
 ======================================
*/

app.post(
  "/api/admin/content",
  authenticateOwner,
  upload.single("video"),
  (req, res) => {

    try {

      const oldContent =
        db.prepare(
          "SELECT * FROM content WHERE id = 1"
        ).get();

      let videoUrl =
        req.body.video_url ||
        oldContent.video_url ||
        "";

      if (req.file) {

        videoUrl =
          "/uploads/" +
          req.file.filename;

      }

      db.prepare(`
        UPDATE content
        SET
          announcement = ?,
          video_url = ?
        WHERE id = 1
      `).run(
        req.body.announcement ||
          oldContent.announcement,
        videoUrl
      );

      res.json({
        message:
          "CYBERGUARD website updated successfully."
      });

    } catch (error) {

      console.error(
        "Admin content error:",
        error
      );

      res.status(500).json({
        error:
          "Unable to update website content."
      });

    }

  }
);


/*
 ======================================
 OWNER:
 VIEW FEEDBACK
 ======================================
*/

app.get(
  "/api/admin/feedback",
  authenticateOwner,
  (req, res) => {

    try {

      const feedback =
        db.prepare(`
          SELECT
            id,
            email,
            message,
            created_at
          FROM feedback
          ORDER BY id DESC
        `).all();

      res.json(
        feedback
      );

    } catch (error) {

      console.error(
        "Feedback retrieval error:",
        error
      );

      res.status(500).json({
        error:
          "Unable to load feedback."
      });

    }

  }
);


/*
 ======================================
 FRONTEND PRODUCTION FILES
 ======================================
*/

const DIST =
  path.join(
    ROOT,
    "dist"
  );

if (
  fs.existsSync(DIST)
) {

  app.use(
    express.static(DIST)
  );

  app.use(
  (req, res, next) => {

    if (
      req.method === "GET" &&
      !req.path.startsWith("/api/") &&
      !req.path.startsWith("/uploads/")
    ) {

      return res.sendFile(
        path.join(
          DIST,
          "index.html"
        )
      );

    }

    next();

  }
);

}


/*
 ======================================
 START SERVER
 ======================================
*/

app.listen(
  PORT,
  () => {

    console.log();

    console.log(
      "======================================"
    );

    console.log(
      "CYBERGUARD WEBSITE SERVER"
    );

    console.log(
      "======================================"
    );

    console.log(
      `http://localhost:${PORT}`
    );

    console.log(
      "======================================"
    );

    console.log(
      `Database: ${DB_FILE}`
    );

  }
);