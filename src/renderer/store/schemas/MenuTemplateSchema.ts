import { createSimpleSchema, list, optional, primitive, raw } from 'serializr';

export const MenuTemplateSchema = createSimpleSchema({
    label: true,
    type: true,
    options: optional(list(primitive())),
    valueReference: raw(),
    value: raw()
});