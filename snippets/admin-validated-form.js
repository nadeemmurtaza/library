// Validate a drawer form against a JSON schema and show errors beside each field.
import schema from '../schemas/product.schema.json' with { type: 'json' }
form.addEventListener('submit', (e) => {
  e.preventDefault()
  const data = coerce(readForm(form))                  // turn number inputs into numbers
  const { valid, errors } = validate(schema, data)
  if (!valid) return showErrors(form, errors)          // focuses the first invalid field
  collection.upsert(data); drawer.close()
})
