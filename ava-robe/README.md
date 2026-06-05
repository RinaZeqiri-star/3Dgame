# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Claude conversations

The `claude-conversations/` folder contains an archive of all the Claude Code chat sessions used while building this project, converted from their original JSONL logs into Markdown.

See [claude-conversations/README.md](claude-conversations/README.md) for the full index.

To regenerate the archive from the latest Claude logs:

```bash
powershell -File scripts/convert-claude-conversations.ps1
powershell -File scripts/build-conversations-index.ps1
```

## AI assistance

Beyond Claude, ChatGPT was also used for brainstorming, research, and code help during the project.

- [ChatGPT project conversation](https://chatgpt.com/g/g-p-68d1bb60e7dc8191bd6714885c43e7de-rina/c/69f36348-434c-83eb-ae97-ffd2c8b47fd6)

## Tools & services used

External tools and services that were used to build the assets and features of this project:

- [remove.bg](https://www.remove.bg/) — removes the background from clothing photos so they can be used as flat textures.
- [VRoid Studio](https://vroid.com/en/studio) — creates and exports the 3D avatar models used in the app.
- [Climatiq API](https://www.climatiq.io/docs) — calculates the carbon footprint / sustainability data for clothing items.

## Technical documentation

Reference docs for the main libraries and APIs the project depends on:

- [Expo ImagePicker](https://docs.expo.dev/versions/latest/sdk/imagepicker/) — picking and capturing images from the device for clothing uploads.
- [MDN — FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData) — building multipart form bodies for image uploads to the backend.
- [Axios](https://axios.rest/pages/getting-started/first-steps) — HTTP client used to talk to the Express server.
