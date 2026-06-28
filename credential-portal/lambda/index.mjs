import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import crypto from "node:crypto";

const s3 = new S3Client({});

const SECURITY_HEADERS = {
  "content-type": "text/html; charset=utf-8",
  "cache-control": "no-store, no-cache, must-revalidate, private",
  pragma: "no-cache",
  expires: "0",
  "content-security-policy":
    "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
  "referrer-policy": "no-referrer",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "permissions-policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
};

const REQUIRED_ENVIRONMENT = ["BUCKET_NAME", "LAB_ACCESS_KEY"];

const STUDENT_ID_ALIASES = ["student id", "student_id", "studentid"];

const DISPLAY_ORDER = [
  "Student ID",
  "Account ID",
  "IAM Username",
  "Console password",
  "FortiFlexTokenID",
  "Access Key ID",
  "Secret",
  "FortiCloud API User",
  "FortiCloud API Password",
  "Program SN",
  "FortiFlex Refresh Token",
];

const LABEL_OVERRIDES = {
  "student id": "Student ID",
  student_id: "Student ID",
  studentid: "Student ID",
  "account id": "AWS account ID",
  account_id: "AWS account ID",
  accountid: "AWS account ID",
  "iam username": "IAM username",
  iam_username: "IAM username",
  iamusername: "IAM username",
  "console password": "AWS console password",
  console_password: "AWS console password",
  consolepassword: "AWS console password",
  fortiflextokenid: "FortiFlex token ID",
  fortiflex_token_id: "FortiFlex token ID",
  "fortiflex token id": "FortiFlex token ID",
  "access key id": "AWS access key ID",
  access_key_id: "AWS access key ID",
  accesskeyid: "AWS access key ID",
  secret: "AWS secret access key",
  "secret access key": "AWS secret access key",
  secret_access_key: "AWS secret access key",
  "forticloud api user": "FortiCloud API user",
  forticloud_api_user: "FortiCloud API user",
  forticloudapiuser: "FortiCloud API user",
  "forticloud api password": "FortiCloud API password",
  forticloud_api_password: "FortiCloud API password",
  forticloudapipassword: "FortiCloud API password",
  "program sn": "FortiFlex program SN",
  program_sn: "FortiFlex program SN",
  programsn: "FortiFlex program SN",
  "fortiflex refresh token": "FortiFlex refresh token",
  fortiflex_refresh_token: "FortiFlex refresh token",
  fortiflexrefreshtoken: "FortiFlex refresh token",
};

export const handler = async (event) => {
  try {
    const method = event.requestContext?.http?.method || "GET";
    const path = event.rawPath || "/";

    if (path !== "/") {
      return htmlResponse(
        messagePage(
          "Page not found",
          "The requested page does not exist.",
          "error"
        ),
        404
      );
    }

    if (method === "GET") {
      return htmlResponse(loginPage());
    }

    if (method !== "POST") {
      return {
        statusCode: 405,
        headers: {
          ...SECURITY_HEADERS,
          allow: "GET, POST",
        },
        body: "Method Not Allowed",
      };
    }

    return await handleCredentialRequest(event);
  } catch (error) {
    console.error("Unhandled application error:", {
      name: error?.name,
      message: error?.message,
    });

    return htmlResponse(
      messagePage(
        "Service unavailable",
        "The credential portal could not process the request. Please contact the lab instructor.",
        "error"
      ),
      500
    );
  }
};

async function handleCredentialRequest(event) {
  const {
    ACCESS_ENABLED,
    ACCESS_EXPIRES_AT,
    BUCKET_NAME,
    CSV_OBJECT_KEY = "ums_credentials.csv",
    LAB_ACCESS_KEY,
  } = process.env;

  const missingEnvironment = REQUIRED_ENVIRONMENT.filter(
    (key) => !process.env[key]
  );

  if (missingEnvironment.length > 0) {
    console.error("Required Lambda configuration is missing.", {
      missingEnvironment,
    });

    return htmlResponse(
      messagePage(
        "Configuration error",
        "The credential portal has not been configured correctly.",
        "error"
      ),
      500
    );
  }

  if (ACCESS_ENABLED !== "true") {
    return htmlResponse(
      messagePage(
        "Access closed",
        "Lab credentials are not currently available.",
        "warning"
      ),
      403
    );
  }

  if (ACCESS_EXPIRES_AT) {
    const expirationTime = Date.parse(ACCESS_EXPIRES_AT);

    if (Number.isNaN(expirationTime)) {
      console.error("ACCESS_EXPIRES_AT is invalid.");

      return htmlResponse(
        messagePage(
          "Configuration error",
          "The credential portal expiration time is invalid.",
          "error"
        ),
        500
      );
    }

    if (Date.now() >= expirationTime) {
      return htmlResponse(
        messagePage(
          "Access expired",
          "The lab credential access period has ended.",
          "warning"
        ),
        403
      );
    }
  }

  const body = decodeRequestBody(event);
  const parameters = new URLSearchParams(body);

  const suppliedAccessKey = String(parameters.get("access_key") || "").trim();
  const studentId = String(parameters.get("student_id") || "")
    .trim()
    .toLowerCase();

  if (!suppliedAccessKey || !studentId) {
    return htmlResponse(
      loginPage("Enter both the lab access key and your student ID."),
      400
    );
  }

  if (!/^student\d{1,4}$/i.test(studentId)) {
    await addFailureDelay();

    return htmlResponse(
      loginPage("The access key or student ID is incorrect."),
      401
    );
  }

  if (!timingSafeStringComparison(suppliedAccessKey, LAB_ACCESS_KEY.trim())) {
    await addFailureDelay();

    return htmlResponse(
      loginPage("The access key or student ID is incorrect."),
      401
    );
  }

  let csvText;

  try {
    const response = await s3.send(
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: CSV_OBJECT_KEY,
      })
    );

    csvText = await response.Body.transformToString("utf-8");
  } catch (error) {
    console.error("Unable to retrieve credential object:", {
      name: error?.name,
      message: error?.message,
    });

    return htmlResponse(
      messagePage(
        "Credentials unavailable",
        "The credential file could not be loaded. Please contact the lab instructor.",
        "error"
      ),
      503
    );
  }

  const records = parseCsv(csvText);

  if (records.length < 2) {
    console.error("Credential CSV contains no data rows.");

    return htmlResponse(
      messagePage(
        "Credentials unavailable",
        "The credential file is empty or invalid.",
        "error"
      ),
      503
    );
  }

  const headers = records[0].map((header) => header.trim());
  const normalizedHeaders = headers.map(normalizeHeader);
  const studentIdColumn = normalizedHeaders.findIndex((header) =>
    STUDENT_ID_ALIASES.includes(header)
  );

  if (studentIdColumn === -1) {
    console.error("Credential CSV has no Student ID column.");

    return htmlResponse(
      messagePage(
        "Credentials unavailable",
        "The credential file format is invalid.",
        "error"
      ),
      503
    );
  }

  const matchingRow = records.slice(1).find((row) => {
    return String(row[studentIdColumn] || "")
      .trim()
      .toLowerCase() === studentId;
  });

  if (!matchingRow) {
    await addFailureDelay();

    return htmlResponse(
      loginPage("The access key or student ID is incorrect."),
      401
    );
  }

  const credentialRecord = {};

  headers.forEach((header, index) => {
    credentialRecord[header] = matchingRow[index] || "";
  });

  return htmlResponse(credentialsPage(credentialRecord));
}

function decodeRequestBody(event) {
  if (!event.body) {
    return "";
  }

  return event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf-8")
    : event.body;
}

function timingSafeStringComparison(valueA, valueB) {
  const digestA = crypto.createHash("sha256").update(valueA, "utf8").digest();
  const digestB = crypto.createHash("sha256").update(valueB, "utf8").digest();

  return crypto.timingSafeEqual(digestA, digestB);
}

async function addFailureDelay() {
  const delay = 400 + Math.floor(Math.random() * 400);

  await new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

function parseCsv(csvText) {
  const rows = [];
  let row = [];
  let field = "";
  let insideQuotes = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const character = csvText[index];
    const nextCharacter = csvText[index + 1];

    if (insideQuotes) {
      if (character === '"' && nextCharacter === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        insideQuotes = false;
      } else {
        field += character;
      }

      continue;
    }

    if (character === '"') {
      insideQuotes = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (character !== "\r") {
      field += character;
    }
  }

  row.push(field);

  if (row.some((value) => value.trim() !== "")) {
    rows.push(row);
  }

  return rows.filter((currentRow) =>
    currentRow.some((value) => value.trim() !== "")
  );
}

function loginPage(errorMessage = "") {
  const errorBlock = errorMessage
    ? `
      <div class="alert alert-error" role="alert">
        ${escapeHtml(errorMessage)}
      </div>
    `
    : "";

  return pageLayout(
    "Lab Credentials",
    `
      <div class="card">
        <div class="brand">FORTINET AWS UMS HANDS-ON LAB</div>

        <h1>Retrieve your lab credentials</h1>

        <p class="intro">
          Enter the shared access key provided by the instructor and your
          assigned Student ID.
        </p>

        ${errorBlock}

        <form method="POST" action="/" autocomplete="off">
          <label for="access_key">Lab access key</label>

          <input
            id="access_key"
            name="access_key"
            type="password"
            required
            maxlength="128"
            autocomplete="off"
          >

          <label for="student_id">Student ID</label>

          <input
            id="student_id"
            name="student_id"
            type="text"
            required
            maxlength="32"
            placeholder="student01"
            autocomplete="off"
            autocapitalize="none"
            spellcheck="false"
          >

          <button type="submit">Show my credentials</button>
        </form>

        <p class="notice">
          Only use credentials assigned to your Student ID. These credentials
          are temporary and intended only for this lab.
        </p>
      </div>
    `
  );
}

function credentialsPage(record) {
  const sortedEntries = sortCredentialEntries(record);

  const rows = sortedEntries
    .map(([key, value]) => {
      const label = getDisplayLabel(key);

      return `
        <div class="credential-row">
          <div class="credential-label">${escapeHtml(label)}</div>

          <div class="credential-value-group">
            <code class="credential">${escapeHtml(value)}</code>

            <button
              type="button"
              class="copy-button"
              data-copy-value="${escapeHtmlAttribute(value)}"
            >
              Copy
            </button>
          </div>
        </div>
      `;
    })
    .join("");

  return pageLayout(
    "Your Lab Credentials",
    `
      <div class="card wide">
        <div class="brand">FORTINET AWS UMS HANDS-ON LAB</div>

        <h1>Your lab credentials</h1>

        <div class="alert alert-warning">
          Do not share, photograph, or reuse these credentials outside the lab.
        </div>

        <div class="credentials">
          ${rows}
        </div>

        <div class="actions">
          <a class="secondary-button" href="/">Close credentials</a>
        </div>
      </div>

      <script>
        document.querySelectorAll(".copy-button").forEach((button) => {
          button.addEventListener("click", async () => {
            try {
              await navigator.clipboard.writeText(button.dataset.copyValue);

              button.textContent = "Copied";

              setTimeout(() => {
                button.textContent = "Copy";
              }, 1500);
            } catch {
              button.textContent = "Copy failed";
            }
          });
        });
      </script>
    `
  );
}

function sortCredentialEntries(record) {
  const preferredOrder = DISPLAY_ORDER.map(normalizeHeader);

  return Object.entries(record)
    .filter(([, value]) => String(value || "").trim() !== "")
    .sort(([keyA], [keyB]) => {
      const indexA = preferredOrder.indexOf(normalizeHeader(keyA));
      const indexB = preferredOrder.indexOf(normalizeHeader(keyB));

      if (indexA === -1 && indexB === -1) {
        return 0;
      }

      if (indexA === -1) {
        return 1;
      }

      if (indexB === -1) {
        return -1;
      }

      return indexA - indexB;
    });
}

function getDisplayLabel(header) {
  return (
    LABEL_OVERRIDES[normalizeHeader(header)] ||
    header
      .replaceAll("_", " ")
      .replace(/\b\w/g, (character) => character.toUpperCase())
  );
}

function normalizeHeader(header) {
  return String(header || "")
    .trim()
    .toLowerCase()
    .replace(/[-\s]+/g, " ");
}

function messagePage(title, message, type) {
  const alertClass =
    type === "error"
      ? "alert-error"
      : type === "warning"
        ? "alert-warning"
        : "";

  return pageLayout(
    title,
    `
      <div class="card">
        <div class="brand">FORTINET AWS UMS HANDS-ON LAB</div>

        <h1>${escapeHtml(title)}</h1>

        <div class="alert ${alertClass}">
          ${escapeHtml(message)}
        </div>

        <div class="actions">
          <a class="secondary-button" href="/">Return</a>
        </div>
      </div>
    `
  );
}

function pageLayout(title, content) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1"
  >

  <meta name="robots" content="noindex, nofollow, noarchive">

  <title>${escapeHtml(title)}</title>

  <style>
    :root {
      color-scheme: light;
      font-family:
        Inter,
        ui-sans-serif,
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;
    }

    * {
      box-sizing: border-box;
    }

    body {
      min-height: 100vh;
      margin: 0;
      padding: 32px 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f3f4f6;
      color: #111827;
    }

    .card {
      width: 100%;
      max-width: 520px;
      padding: 32px;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 14px;
      box-shadow: 0 12px 35px rgba(0, 0, 0, 0.08);
    }

    .card.wide {
      max-width: 860px;
    }

    .brand {
      margin-bottom: 12px;
      color: #da291c;
      font-size: 0.78rem;
      font-weight: 800;
      letter-spacing: 0.08em;
    }

    h1 {
      margin: 0 0 12px;
      font-size: 1.75rem;
      line-height: 1.2;
    }

    .intro,
    .notice {
      color: #4b5563;
      line-height: 1.6;
    }

    form {
      margin-top: 24px;
    }

    label {
      display: block;
      margin: 18px 0 7px;
      font-weight: 700;
    }

    input {
      width: 100%;
      padding: 12px 14px;
      border: 1px solid #9ca3af;
      border-radius: 8px;
      font: inherit;
    }

    input:focus {
      outline: 3px solid rgba(218, 41, 28, 0.2);
      border-color: #da291c;
    }

    button,
    .secondary-button {
      border-radius: 8px;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
    }

    form > button {
      width: 100%;
      margin-top: 24px;
      padding: 13px 18px;
      border: 0;
      background: #da291c;
      color: #ffffff;
    }

    .alert {
      margin: 20px 0;
      padding: 13px 15px;
      border-radius: 8px;
      background: #eff6ff;
      color: #1e3a8a;
      line-height: 1.5;
    }

    .alert-error {
      background: #fef2f2;
      color: #991b1b;
    }

    .alert-warning {
      background: #fffbeb;
      color: #92400e;
    }

    .credentials {
      overflow: hidden;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
    }

    .credential-row {
      padding: 15px;
      border-bottom: 1px solid #e5e7eb;
    }

    .credential-row:last-child {
      border-bottom: 0;
    }

    .credential-label {
      margin-bottom: 7px;
      color: #4b5563;
      font-size: 0.85rem;
      font-weight: 700;
    }

    .credential-value-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .credential {
      min-width: 0;
      flex: 1;
      padding: 10px;
      overflow-wrap: anywhere;
      border-radius: 6px;
      background: #f3f4f6;
    }

    .copy-button {
      flex: 0 0 auto;
      padding: 9px 12px;
      border: 1px solid #d1d5db;
      background: #ffffff;
    }

    .actions {
      margin-top: 24px;
    }

    .secondary-button {
      display: inline-block;
      padding: 11px 16px;
      border: 1px solid #9ca3af;
      color: #111827;
      text-decoration: none;
    }

    @media (max-width: 600px) {
      body {
        align-items: flex-start;
        padding: 16px 10px;
      }

      .card {
        padding: 22px 17px;
      }

      .credential-value-group {
        align-items: stretch;
        flex-direction: column;
      }

      .copy-button {
        width: 100%;
      }
    }
  </style>
</head>

<body>
  <main>
    ${content}
  </main>
</body>
</html>`;
}

function htmlResponse(html, statusCode = 200) {
  return {
    statusCode,
    headers: SECURITY_HEADERS,
    body: html,
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeHtmlAttribute(value) {
  return escapeHtml(value).replaceAll("\n", "&#10;").replaceAll("\r", "&#13;");
}
