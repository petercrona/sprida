interface Model {
    alphabetTranslationTable: { [key: string]: number },
    entropy: number,
    stringPreProcess: (str: string) => string
}

const indexString = (xs: string): { [key: string]: number } => {
    return xs.split('').reduce(
        (memo, x, i) => {
            memo[x] = i;
            return memo;
        },
        {}
    );
};

const calculateEntropy = (alphabet: string) => {
    return Math.log2(alphabet.length);
};

const alphabetToPowerOf2 = (alphabet: string): string => {
    return alphabet.substring(
        0,
        Math.pow(2, Math.floor(Math.log2(alphabet.length)))
    );
};

/**
 * Create your own model to use with "toGroup". This allows you
 * to support ids other than uuid v4. Note that the ids must
 * be random in all characters that are provided in the alphabet. 
 * @param alphabet String of characters that strings may consist of.
 * @param preProcess: Allows you to preprocess the string, eg. make it lower case.
 */
export const createModel = (alphabet: string, preProcess = (x: string) => x): Model => {
    const trimmedAlphabet = alphabetToPowerOf2(alphabet);
    const re = new RegExp('[^' + trimmedAlphabet + ']', 'g');

    return {
        alphabetTranslationTable: indexString(trimmedAlphabet),
        entropy: calculateEntropy(trimmedAlphabet),
        stringPreProcess: str => preProcess(str).replace(re, '')
    };
};

const uuid4Model = createModel('0123456789abcdef', x => x.toLowerCase());

const getBitsFromString = (symbolsNeeded: number, model: Model, processedString: string) => {
    let bitsFromString = 0;
    for (let i = 0; i < symbolsNeeded; i++) {
        bitsFromString = (bitsFromString << model.entropy)
            | model.alphabetTranslationTable[processedString.charAt(i)];
    }
    return bitsFromString;
}

const mapGroupNumber = (weights: number[], maxGroupNumber: number, group: number) => {
    const nrGroups = weights.length;
    const sumOfWeights = weights.reduce((x, y) => x + y, 0);
    const percentageWeights = weights.map(x => x / sumOfWeights);
    
    const groupSizes = percentageWeights.map(percentage => {
        return Math.floor(percentage * maxGroupNumber);
    });

    for (let i = 0, groupNumber = 0; groupNumber < nrGroups; groupNumber++) {
        if (group >= i && group < i + groupSizes[groupNumber]) {
            return groupNumber;
        }
        i += groupSizes[groupNumber];
    }

    // we put the remainder in group 0.
    return 0;
}

/**
 * Map a string into a group, where the distribution and number of groups is specified using the weights parameter.
 * @param weights An array of numbers. Eg. [9, 1] will create 2 groups and put 90% of the ids to group 0 and 10% to group 1.
 * @param string The string to map to a group.
 * @param model Optionally provide your own model. See createModel.
 */
export const toGroup = (weights: number[], string: string, model: Model = uuid4Model): number => {
    const nrGroups = weights.length;
    const processedString = model.stringPreProcess(string);
    const entropyBitsInString = processedString.length * model.entropy;
    const nrBitsNeededForNrGroups = Math.ceil(Math.log2(nrGroups));

    if (entropyBitsInString < nrBitsNeededForNrGroups) {
        throw new Error('Number of entropy bits in string too low');
    }

    const bitsOfStringToUse = Math.min(entropyBitsInString, 20);
    const maxGroupNumber = Math.pow(2, bitsOfStringToUse);
    const bitmask = maxGroupNumber - 1; // all 1s

    const symbolsNeeded = Math.ceil(bitsOfStringToUse / model.entropy);
    let bitsFromString = getBitsFromString(symbolsNeeded, model, processedString);
    const group = bitsFromString & bitmask;

    return mapGroupNumber(weights, maxGroupNumber, group);
};