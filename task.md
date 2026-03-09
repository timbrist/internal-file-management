# Target
Build a chat-like message composer that supports plain text, pasted text, pasted screenshots, uploaded files, and drag-and-drop attachments. Submitted messages appear in a message list above the composer with timestamp and delete action. Each message may contain text, zero or more attachments, or both.

## Target divides into 4 sub-system: 

1. **Input Layer:** Users enter content in a chat area, supporting keyboard input, pasting text, pasting images, selecting files, and dragging and dropping files.
2. **Temporary Storage Layer:** Before sending, the input box may contain text and multiple attachments simultaneously.
3. **Submission Layer:** After pressing Enter or clicking send, the message is submitted to the server.
4. **Display Layer:** The message appears in the list above, displaying its content, time, and a delete button.

## Stacks:
1. frontend: react-ts,tailwind, daisyUI,
2. backend: prisma orm,
3. database: Postgresql

## Define the object 

A. Message: Represents a chat record For example: Text content Sent time What attachments did the message contain? Has it been deleted?

B. Attachment: This represents an attachment within a message.For example: File name File type
File size Storage location Thumbnail address Which message does it belong to?
Therefore, the relationship is usually:1 message Corresponding to 0 or more attachments

## Interaction

### Input Phase
Users can do the following in the input area:
1. Enter text directly
2. Paste text using Ctrl/Cmd + V
3. Paste a screenshot
4. Paste a file
5. Drag and drop a file into the input area
6. Click the upload button to select a file

### Sending Phase
User clicks send or presses Enter:
1. If only text is sent, send the text.
2. If only an attachment is sent, send the attachment message.
3. If both are sent, send them together.

### Display Phase
New message displayed at the top:
1. Text content
2. Image preview / File card
3. Time
4. Delete icon

### Delete Phase
Click the delete icon:
1. Front-end confirms first
2. Requests back-end deletion
3. UI updates to "Deleted" or removes directly.

## The front-end is best divided into 3 areas:
### MessageList
Top message list
Responsibilities:
1. Render historical messages
2. Sort by time
3. Display date/time
4. Display delete button
5. Display images, files, and text

### Composer
Bottom input area
Responsibilities:
1. Enter text
2. Receive paste
3. Receive drag/drop
4. Display preview of attachments to be sent
5. Handle Enter to send

### Upload Handler
Upload processing logic
Responsibilities:
1. Convert File objects to previews
2. Validate type/size
3. Upload to the server
4. Return file URL
5. submit along with the message

## Suggest datatype
```typescript
type AttachmentType = "image" | "file";

type Attachment = {
  id: string;
  type: AttachmentType;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
};

type Message = {
  id: string;
  text: string;
  createdAt: string;
  attachments: Attachment[];
  deletedAt?: string | null;
};
```

If it hasn't been sent yet, the front-end usually requires a "local attachment" type:
```typescript
type DraftAttachment = {
  localId: string;
  file: File;
  previewUrl?: string;
  type: "image" | "file";
  status: "idle" | "uploading" | "uploaded" | "error";
  uploadedUrl?: string;
};
```
