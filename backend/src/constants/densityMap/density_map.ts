const DENSITY_MAP = {
    airy: {
        rowGap: 2,
        dominantRowSpan: 4,
        supportingRowSpan: 2
    },
    normal: {
        rowGap: 1,
        dominantRowSpan: 3,
        supportingRowSpan: 2
    },
    compact: {
        rowGap: 0,
        dominantRowSpan: 2,
        supportingRowSpan: 1
    }
} as const;

export default DENSITY_MAP
