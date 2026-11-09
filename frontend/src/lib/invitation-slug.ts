const SLUG_FALLBACKS: Record<string, string> = {
    wedding: 'undangan-pernikahan',
    birthday: 'ulang-tahun',
    khitanan: 'khitanan',
    aqiqah: 'aqiqah',
    gender_reveal: 'gender-reveal',
    syukuran: 'syukuran',
};

const SLUG_SOURCE_LABELS: Record<string, string> = {
    wedding: 'Nama Pengantin',
    birthday: 'Nama Anak',
    khitanan: 'Nama Anak',
    aqiqah: 'Nama Bayi',
    gender_reveal: 'Nama Orang Tua',
    syukuran: 'Nama Tuan Rumah',
};

function pickFirstSlugCandidate(values: Array<string | null | undefined>): string {
    for (const value of values) {
        const normalized = normalizeInvitationSlug(value ?? '');
        if (normalized) {
            return normalized;
        }
    }

    return '';
}

export function normalizeInvitationSlug(value: string): string {
    return String(value ?? '')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-');
}

export function resolveInvitationSlugBase(
    eventTypeName: string,
    fieldValues: Record<string, string>,
): string {
    switch (eventTypeName) {
        case 'wedding':
            return pickFirstSlugCandidate([
                [fieldValues.groom_nickname, fieldValues.bride_nickname].filter(Boolean).join(' '),
                [fieldValues.groom_name, fieldValues.bride_name].filter(Boolean).join(' '),
                SLUG_FALLBACKS.wedding,
            ]);
        case 'birthday':
            return pickFirstSlugCandidate([
                fieldValues.child_name,
                fieldValues.child_nickname,
                SLUG_FALLBACKS.birthday,
            ]);
        case 'khitanan':
            return pickFirstSlugCandidate([
                fieldValues.child_name,
                fieldValues.child_nickname,
                SLUG_FALLBACKS.khitanan,
            ]);
        case 'aqiqah':
            return pickFirstSlugCandidate([
                fieldValues.baby_name,
                fieldValues.baby_nickname,
                SLUG_FALLBACKS.aqiqah,
            ]);
        case 'gender_reveal':
            return pickFirstSlugCandidate([
                [fieldValues.team_a_name, fieldValues.team_b_name].filter(Boolean).join(' '),
                [fieldValues.mother_name, fieldValues.father_name].filter(Boolean).join(' '),
                SLUG_FALLBACKS.gender_reveal,
            ]);
        case 'syukuran':
            return pickFirstSlugCandidate([
                fieldValues.host_name,
                fieldValues.occasion,
                SLUG_FALLBACKS.syukuran,
            ]);
        default:
            return pickFirstSlugCandidate([
                fieldValues.title,
                fieldValues.name,
                'undangan',
            ]);
    }
}

export function resolveInvitationSlugSourceLabel(eventTypeName: string): string {
    return SLUG_SOURCE_LABELS[eventTypeName] ?? 'Data utama';
}

export function buildInvitationPublicUrl(origin: string, slug: string): string {
    const normalizedSlug = normalizeInvitationSlug(slug);
    const trimmedOrigin = origin.replace(/\/$/, '');

    if (!trimmedOrigin) {
        return `/${normalizedSlug}`;
    }

    return `${trimmedOrigin}/${normalizedSlug}`;
}
