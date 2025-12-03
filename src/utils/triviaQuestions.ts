// Crypto Trivia Questions

export interface TriviaQuestion {
    id: number;
    question: string;
    options: string[];
    correctIndex: number;
}

export const TRIVIA_QUESTIONS: TriviaQuestion[] = [
    {
        id: 1,
        question: "What is the maximum supply of Bitcoin?",
        options: ["21 million", "100 million", "1 billion", "Unlimited"],
        correctIndex: 0
    },
    {
        id: 2,
        question: "What year was Bitcoin created?",
        options: ["2005", "2009", "2011", "2013"],
        correctIndex: 1
    },
    {
        id: 3,
        question: "What is the name of Ethereum's native cryptocurrency?",
        options: ["Bitcoin", "Ether (ETH)", "Ripple", "Litecoin"],
        correctIndex: 1
    },
    {
        id: 4,
        question: "What year was Ethereum launched?",
        options: ["2013", "2015", "2017", "2019"],
        correctIndex: 1
    },
    {
        id: 5,
        question: "What does 'HODL' stand for in crypto culture?",
        options: ["Hold On for Dear Life", "High Order Digital Ledger", "Honest Open Distributed Ledger", "It's a misspelling of 'hold'"],
        correctIndex: 3
    },
    {
        id: 6,
        question: "What is a 'smart contract'?",
        options: ["A legal document for crypto", "Self-executing code on blockchain", "A type of hardware wallet", "An agreement between miners"],
        correctIndex: 1
    },
    {
        id: 7,
        question: "What is the process of validating Bitcoin transactions called?",
        options: ["Staking", "Mining", "Forging", "Burning"],
        correctIndex: 1
    },
    {
        id: 8,
        question: "What is a 'whale' in cryptocurrency?",
        options: ["A type of altcoin", "Someone who holds large amounts of crypto", "A mining pool", "A blockchain protocol"],
        correctIndex: 1
    },
    {
        id: 9,
        question: "What does NFT stand for?",
        options: ["New Financial Token", "Non-Fungible Token", "Network File Transfer", "Next-gen Fintech Tool"],
        correctIndex: 1
    },
    {
        id: 10,
        question: "Who is credited with creating Bitcoin?",
        options: ["Vitalik Buterin", "Satoshi Nakamoto", "Charlie Lee", "Elon Musk"],
        correctIndex: 1
    },
    {
        id: 11,
        question: "What is a 'gas fee' in Ethereum?",
        options: ["Fee for fuel purchases with crypto", "Transaction processing cost", "Mining equipment cost", "Exchange listing fee"],
        correctIndex: 1
    },
    {
        id: 12,
        question: "What does DeFi stand for?",
        options: ["Definite Finance", "Decentralized Finance", "Digital Fiat", "Distributed Fiduciary"],
        correctIndex: 1
    },
    {
        id: 13,
        question: "What is the term for when crypto prices drop significantly?",
        options: ["Bear market", "Bull market", "Crab market", "Wolf market"],
        correctIndex: 0
    },
    {
        id: 14,
        question: "What is 'staking' in cryptocurrency?",
        options: ["Gambling with crypto", "Locking crypto to earn rewards", "Selling all your holdings", "Creating new tokens"],
        correctIndex: 1
    },
    {
        id: 15,
        question: "What blockchain is known for its dog-themed meme coin?",
        options: ["Bitcoin", "Ethereum", "Dogecoin", "Cardano"],
        correctIndex: 2
    },
    {
        id: 16,
        question: "What is a 'cold wallet'?",
        options: ["A wallet in cold regions", "Offline storage for crypto", "A frozen exchange account", "A wallet with no funds"],
        correctIndex: 1
    },
    {
        id: 17,
        question: "What does 'DYOR' mean in crypto communities?",
        options: ["Do Your Own Research", "Deposit Your Own Resources", "Digital Yield Optimization Rate", "Don't Yell Out Randomly"],
        correctIndex: 0
    },
    {
        id: 18,
        question: "What is the smallest unit of Bitcoin called?",
        options: ["Bit", "Satoshi", "Wei", "Gwei"],
        correctIndex: 1
    },
    {
        id: 19,
        question: "What type of blockchain consensus does Ethereum 2.0 use?",
        options: ["Proof of Work", "Proof of Stake", "Proof of Authority", "Proof of History"],
        correctIndex: 1
    },
    {
        id: 20,
        question: "What is 'market cap' in cryptocurrency?",
        options: ["Maximum price limit", "Total value of all coins", "Daily trading volume", "Number of exchanges listed"],
        correctIndex: 1
    }
];

// Get a random question that hasn't been answered yet
export const getRandomQuestion = (answeredIds: number[]): TriviaQuestion | null => {
    const available = TRIVIA_QUESTIONS.filter(q => !answeredIds.includes(q.id));
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
};

// Get a specific question by index (for sequential play)
export const getQuestionByIndex = (index: number): TriviaQuestion | null => {
    if (index < 0 || index >= TRIVIA_QUESTIONS.length) return null;
    return TRIVIA_QUESTIONS[index];
};

