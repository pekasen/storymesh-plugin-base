import { IMetaData } from 'storygraph';
import { date, list, ModelSchema, primitive } from 'serializr';


export const MetaDataSchema: ModelSchema<IMetaData> = {
    props: {
        name: true,
        createdAt: date(),
        tags: list(primitive())
    },
    factory: ({ json }) => ({
        name: json.name,
        createdAt: json.createdAt,
        tags: json.tags
    })
};
