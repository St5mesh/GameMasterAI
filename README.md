# GameMaster.AI

GameMaster.AI is a web-based application designed to deliver a single-player tabletop role-playing game (TTRPG) experience, guided by an AI Dungeon Master. Supporting both OpenAI models (GPT-3.5-turbo and GPT-4) and local models via LM Studio, this platform offers a seamless integration of an AI Dungeon Master with an AI notetaker to craft an immersive narrative for games like Dungeons & Dragons.

The project originated from Cole Porter (Deck of DM Things on YouTube) and was supported by a dedicated Patreon community. When the project grew beyond the scope manageable by Cole, the decision was made to open-source GameMaster.AI and discontinue the Patreon.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Setting up External Dependencies](#setting-up-external-dependencies)
  - [Option 1: OpenAI API (Cloud-based)](#option-1-openai-api-cloud-based)
  - [Option 2: LM Studio (Local Models)](#option-2-lm-studio-local-models)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Credits](#credits)
- [Contact](#contact)

## Prerequisites

Required software and libraries are listed in the project’s `package.json` file found in the root directory.

## Setting up External Dependencies

GameMaster.AI supports two AI provider options: **OpenAI API** (cloud-based) or **LM Studio** (local models). You only need to set up one of these options.

### .env File

Create a `.env` file in the root directory. You can copy `.env.example` as a starting template.

### AI Provider Configuration

Choose one of the following options:

#### Option 1: OpenAI API (Cloud-based)

- **Purpose**: Use OpenAI's GPT models (GPT-4, GPT-3.5-turbo) for game content generation.
- **Pros**: High-quality responses, reliable, no local resources needed.
- **Cons**: Requires API key, costs per token used.
- **Setup**:
  1. Sign up for an account at [OpenAI](https://openai.com/).
  2. Generate an API key in the API section.
  3. In your `.env` file, add:
     ```
     AI_PROVIDER=openai
     OPENAI_API_KEY=sk-your_api_key_here
     ```

#### Option 2: LM Studio (Local Models)

- **Purpose**: Run AI models locally on your machine using LM Studio.
- **Pros**: Free, private, no API costs, works offline.
- **Cons**: Requires powerful hardware (GPU recommended), quality depends on model.
- **Setup**:
  1. Download and install [LM Studio](https://lmstudio.ai/).
  2. Download a compatible chat model (recommended: Mistral 7B, Llama 2, or similar instruct/chat models).
  3. In LM Studio, load your model and start the local server (default: http://localhost:1234).
  4. In your `.env` file, add:
     ```
     AI_PROVIDER=lmstudio
     LM_STUDIO_BASE_URL=http://localhost:1234/v1
     LM_STUDIO_MODEL_DM=your-model-name
     LM_STUDIO_MODEL_CAMPAIGN=your-model-name
     LM_STUDIO_MODEL_SUMMARY=your-model-name
     ```
     Note: Replace `your-model-name` with the actual model identifier from LM Studio. You can use the same model for all three purposes or different models for each.

### MongoDB Atlas

- **Purpose**: Storing game save data and user accounts.
- **Setup**:
  1. Sign up or log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
  2. Create a new cluster and follow the setup guide.
  3. Retrieve your connection string by navigating to the 'Connect' section of your cluster.
  4. In your `.env` file, add `MONGODB_URI=your_connection_string`.

### SESSION_SECRET and JWT_SECRET

These are cryptographic keys used for securing sessions and token-based authentication respectively. Despite local deployment, it's crucial to use unique and random strings to prevent potential security breaches.

### Installation

1. Ensure that you have npm installed on your machine. If not, download and install [npm](https://www.npmjs.com/get-npm).
2. In the project's root directory, execute `npm install` to install dependencies.
   - If you encounter any issues, such as permissions errors, consult the npm troubleshooting guide (https://docs.npmjs.com/getting-started/troubleshooting)

### Usage

To start GameMasterAI:

1. Open a terminal and navigate to the project's root directory.
2. Run `npm start` to launch both frontend and backend servers.
3. Open your web browser and enter the local URL provided by the output in the terminal.

You will be greeted with a user interface displaying the GameMasterAI logo and options to start a new game or load an existing one. First time users should follow the new game route to setup and then play.

## Contributing

Your contributions are welcome! Whether it's bug reporting, code improvement, feature proposal, or project maintenance, your help is invaluable.

### Development Process

We embrace [Github Flow](https://guides.github.com/introduction/flow/index.html). All changes are made through pull requests.

### Making Contributions

To contribute, follow these steps:

1. Fork the repository and create your branch from `main`.
2. Write clear, commented, and testable code.
3. Update documentation to reflect any changes.
4. Ensure your code adheres to the coding style guide.
5. Submit a pull request with a comprehensive description of changes.

### License

Contributions are licensed under the [MIT License](LICENSE). Ensure you understand the license implications before contributing.

### Reporting Bugs

Report bugs and issues on the Discrord: https://discord.gg/GdsmyUX69N

**Effective bug reports should include:**

- A summary and background
- Reproduction steps with specific examples
- The expected outcome
- What actually occurred
- Additional notes or hypotheses

### Coding Style

- Use 4 spaces for indentation.
- Run `npm run lint` before committing to ensure consistent code style.

## License

This project is made available under the [MIT License](LICENSE).

## Credits

Special thanks to our Patreon supporters who helped kickstart this project. (Full list of supporters at the document's end)

Parts of this project were developed with assistance from GPT-4 by OpenAI.

## Contact

Email: deckofdmthings@gmail.com

## Original Patreon Supporters

Original Patreon supporters:
lalilunanu
Jonny Martinez
Michelle Hedden
Aaron Aldaco
MadWhim
Lerust
Rodrigo Raya
WhiteBulL
Viktor Grén
Matthew W Rodgers
Jim Harten
Mephisto Strange
Foundry Fabrications
Julius Lahdenoja
Humble Arrogance
Greg Germano
Ethan Babauta
Panzrom 
Chad Bastian
Benjamin Catt
Julienlemab Roblox
Aviox
Snowdric
bill mother
LetterQ
Matthew Akin
czechpls 
Monsi7
Jay Kudo
Shift_
yuri 2
Randy Prather
Midnight Black Wolf
AWS
Mahn Jones
Jonatan 
K
Jason Findley
Chase
Jason
Keegan 
Dragonistic
DarnChaCha 
Gab
Ash
Syquan Perrett
Jakub Čech
Jake 
Austin Caudill
Vincent Chalnot
Lasse
ArcaneOverride
Jason Apgar
Dave Hunt
Eli Blake
Timothy Castillo
saphix gaming
Geoffrey Ashe
Gecepe Tango Mango
Allen Hueffmeier
Dizzel
BrotherHanan
Julien Kovacs
theeddy 329
Beefy Beef
Tucker Radgens
Scientist Tomzi White Cloud
Bgjjj Gggh
Matt Lewis
Chris Turnbull
Sven
Nicholas Shappell
Zac
Evelien
JohnJ
Stig 
DominoTwo
Addie
Rickard Nilsson
Grekqo
Presten Stewart
Mason J.
Michael King
Marius Rognstad
David Williams
DeFour
Brandon Mabry
Levi Carpman
FletcherCutting
Remi Løvik
Vlad Dumitru
Astyria
Brandon Laszynskyj
Mark Shuttleworth
KLM
Ironspider 1
James Lyons
Jonathan LANIER
Andrew Hamilton
Edy
Josh Phillips
Maks
Andrew Wagner
Jeremy Seaton
Garrett
Dan Smith
Joshua McVay
Lars Hoffmann
Gael Lendoiro
Pedro_26
mikel sleep
Robert Davidsson
Julien Gaillard
Rubychoco
Avery Goodname
J N
Revolve02
Samuel Hargraves
Knism

