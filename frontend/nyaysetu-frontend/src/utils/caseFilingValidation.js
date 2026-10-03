const MAX_TITLE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 20 * 100;
const MAX_PARTY_NAME_LENGTH = 120;
const MAX_LOCATION_LENGTH = 160;

export const CASE_FIELD_LIMITS = {
    title: MAX_TITLE_LENGTH,
    description: MAX_DESCRIPTION_LENGTH,
    partyName: MAX_PARTY_NAME_LENGTH,
    location: MAX_LOCATION_LENGTH,
};

const VALID_CASE_TYPES = ['civil', 'criminal', 'family', 'property', 'commercial'];
const VALID_URGENCY_LEVELS = ['normal', 'urgent', 'critical'];

const getText = (value) => (typeof value === 'string' ? value.trim() : '');

export function sanitizeCaseDraft(data = {}) {
    return {
        caseType: VALID_CASE_TYPES.includes(data.caseType) ? data.caseType : '',
        title: typeof data.title === 'string' ? data.title.slice(0, CASE_FIELD_LIMITS.title) : '',
        description: typeof data.description === 'string' ? data.description.slice(0, CASE_FIELD_LIMITS.description) : '',
        petitioner: typeof data.petitioner === 'string' ? data.petitioner.slice(0, CASE_FIELD_LIMITS.partyName) : '',
        respondent: typeof data.respondent === 'string' ? data.respondent.slice(0, CASE_FIELD_LIMITS.partyName) : '',
        urgency: VALID_URGENCY_LEVELS.includes(data.urgency) ? data.urgency : 'normal',
        documents: [],
    };
}

export function sanitizeFirDraft(data = {}) {
    return {
        title: typeof data.title === 'string' ? data.title.slice(0, CASE_FIELD_LIMITS.title) : '',
        description: typeof data.description === 'string' ? data.description.slice(0, CASE_FIELD_LIMITS.description) : '',
        incidentDate: typeof data.incidentDate === 'string' ? data.incidentDate : '',
        incidentLocation: typeof data.incidentLocation === 'string'
            ? data.incidentLocation.slice(0, CASE_FIELD_LIMITS.location)
            : '',
    };
}

export function validateCaseFiling(formData = {}) {
    const errors = {};

    if (!VALID_CASE_TYPES.includes(formData.caseType)) {
        errors.caseType = 'Select a case type to continue.';
    }

    const title = getText(formData.title);
    if (!title) {
        errors.title = 'Enter a short case title.';
    } else if (title.length > CASE_FIELD_LIMITS.title) {
        errors.title = `Case title must be ${CASE_FIELD_LIMITS.title} characters or fewer.`;
    }

    const description = getText(formData.description);
    if (!description) {
        errors.description = 'Describe the facts of your case.';
    } else if (description.length < 20) {
        errors.description = 'Add at least 20 characters so the court has enough context.';
    } else if (description.length > CASE_FIELD_LIMITS.description) {
        errors.description = `Case description must be ${CASE_FIELD_LIMITS.description} characters or fewer.`;
    }

    const petitioner = getText(formData.petitioner);
    if (!petitioner) {
        errors.petitioner = 'Enter the petitioner name.';
    } else if (petitioner.length > CASE_FIELD_LIMITS.partyName) {
        errors.petitioner = `Petitioner name must be ${CASE_FIELD_LIMITS.partyName} characters or fewer.`;
    }

    const respondent = getText(formData.respondent);
    if (!respondent) {
        errors.respondent = 'Enter the respondent name.';
    } else if (respondent.length > CASE_FIELD_LIMITS.partyName) {
        errors.respondent = `Respondent name must be ${CASE_FIELD_LIMITS.partyName} characters or fewer.`;
    }

    if (!VALID_URGENCY_LEVELS.includes(formData.urgency)) {
        errors.urgency = 'Choose a valid urgency level.';
    }

    return errors;
}

export function validateFirFiling(firData = {}) {
    const errors = {};

    const title = getText(firData.title);
    if (!title) {
        errors.firTitle = 'Enter an incident title.';
    } else if (title.length > CASE_FIELD_LIMITS.title) {
        errors.firTitle = `Incident title must be ${CASE_FIELD_LIMITS.title} characters or fewer.`;
    }

    const description = getText(firData.description);
    if (!description) {
        errors.firDescription = 'Describe what happened.';
    } else if (description.length < 20) {
        errors.firDescription = 'Add at least 20 characters so the report has enough detail.';
    } else if (description.length > CASE_FIELD_LIMITS.description) {
        errors.firDescription = `Incident description must be ${CASE_FIELD_LIMITS.description} characters or fewer.`;
    }

    const location = getText(firData.incidentLocation);
    if (location.length > CASE_FIELD_LIMITS.location) {
        errors.incidentLocation = `Location must be ${CASE_FIELD_LIMITS.location} characters or fewer.`;
    }

    return errors;
}

export function getCaseStepFields(step) {
    switch (step) {
        case 1:
            return ['caseType'];
        case 2:
            return ['title', 'description', 'petitioner', 'respondent'];
        case 4:
            return ['caseType', 'title', 'description', 'petitioner', 'respondent'];
        default:
            return [];
    }
}

export function getStepErrors(step, errors) {
    return getCaseStepFields(step).reduce((stepErrors, field) => {
        if (errors[field]) {
            stepErrors[field] = errors[field];
        }
        return stepErrors;
    }, {});
}

export function getRestorableCaseStep(savedStep, formData) {
    const step = Number.isInteger(savedStep) ? savedStep : Number(savedStep);
    const safeStep = Math.min(Math.max(step || 1, 1), 4);
    const errors = validateCaseFiling(formData);

    if (errors.caseType) {
        return 1;
    }

    if (['title', 'description', 'petitioner', 'respondent'].some((field) => errors[field])) {
        return Math.min(safeStep, 2);
    }

    return safeStep;
}

export function hasMeaningfulCaseDraft(formData = {}) {
    return Boolean(
        getText(formData.caseType)
        || getText(formData.title)
        || getText(formData.description)
        || getText(formData.petitioner)
        || getText(formData.respondent)
        || (Array.isArray(formData.documents) && formData.documents.length > 0)
    );
}

export function hasMeaningfulFirDraft(firData = {}, firFile = null) {
    return Boolean(
        getText(firData.title)
        || getText(firData.description)
        || getText(firData.incidentDate)
        || getText(firData.incidentLocation)
        || firFile
    );
}
