export const tableSchemas = {
  profiles: {
    name: 'Profiles',
    readOnly: true,
    columns: [
      { key: 'id', label: 'ID', type: 'text', mono: true },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'is_superadmin', label: 'Superadmin', type: 'boolean' },
      { key: 'created_datetime_utc', label: 'Created', type: 'date' },
    ]
  },
  images: {
    name: 'Images',
    readOnly: false,
    columns: [
      { key: 'id', label: 'ID', type: 'text', mono: true, hideInForm: true },
      { key: 'url', label: 'Image URL', type: 'text' },
      { key: 'is_public', label: 'Public', type: 'boolean' },
      { key: 'is_common_use', label: 'Common Use', type: 'boolean' },
      { key: 'image_description', label: 'Description', type: 'textarea' },
      { key: 'created_datetime_utc', label: 'Created', type: 'date', hideInForm: true },
    ]
  },
  humor_flavors: {
    name: 'Humor Flavors',
    readOnly: true,
    columns: [
      { key: 'id', label: 'ID', type: 'text', mono: true },
      { key: 'slug', label: 'Slug', type: 'text' },
      { key: 'description', label: 'Description', type: 'text' },
      { key: 'created_datetime_utc', label: 'Created', type: 'date' },
    ]
  },
  humor_flavor_steps: {
    name: 'Humor Flavor Steps',
    readOnly: true,
    columns: [
      { key: 'id', label: 'ID', type: 'text', mono: true },
      { key: 'humor_flavor_id', label: 'Flavor ID', type: 'text' },
      { key: 'order_by', label: 'Order', type: 'number' },
      { key: 'description', label: 'Description', type: 'text' },
      { key: 'llm_model_id', label: 'Model ID', type: 'text' },
    ]
  },
  terms: {
    name: 'Terms',
    readOnly: false,
    columns: [
      { key: 'id', label: 'ID', type: 'text', mono: true, hideInForm: true },
      { key: 'term', label: 'Term', type: 'text' },
      { key: 'definition', label: 'Definition', type: 'textarea' },
      { key: 'example', label: 'Example', type: 'textarea' },
      { key: 'priority', label: 'Priority', type: 'number' },
    ]
  },
  captions: {
    name: 'Captions',
    readOnly: true,
    columns: [
      { key: 'id', label: 'ID', type: 'text', mono: true },
      { key: 'content', label: 'Content', type: 'text' },
      { key: 'like_count', label: 'Likes', type: 'number' },
      { key: 'is_featured', label: 'Featured', type: 'boolean' },
    ]
  },
  caption_requests: {
    name: 'Caption Requests',
    readOnly: true,
    columns: [
      { key: 'id', label: 'ID', type: 'text', mono: true },
      { key: 'image_id', label: 'Image ID', type: 'text' },
      { key: 'profile_id', label: 'Profile ID', type: 'text' },
      { key: 'created_datetime_utc', label: 'Created', type: 'date' },
    ]
  },
  caption_examples: {
    name: 'Caption Examples',
    readOnly: false,
    columns: [
      { key: 'id', label: 'ID', type: 'text', mono: true, hideInForm: true },
      { key: 'image_id', label: 'Image ID', type: 'text' },
      { key: 'caption', label: 'Caption', type: 'text' },
      { key: 'explanation', label: 'Explanation', type: 'textarea' },
      { key: 'priority', label: 'Priority', type: 'number' },
    ]
  },
  llm_models: {
    name: 'LLM Models',
    readOnly: false,
    columns: [
      { key: 'id', label: 'ID', type: 'text', mono: true, hideInForm: true },
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'llm_provider_id', label: 'Provider ID', type: 'text' },
      { key: 'provider_model_id', label: 'Provider Model ID', type: 'text' },
    ]
  },
  llm_providers: {
    name: 'LLM Providers',
    readOnly: false,
    columns: [
      { key: 'id', label: 'ID', type: 'text', mono: true, hideInForm: true },
      { key: 'name', label: 'Name', type: 'text' },
    ]
  },
  llm_prompt_chains: {
    name: 'LLM Prompt Chains',
    readOnly: true,
    columns: [
      { key: 'id', label: 'ID', type: 'text', mono: true },
      { key: 'caption_request_id', label: 'Request ID', type: 'text' },
      { key: 'created_datetime_utc', label: 'Created', type: 'date' },
    ]
  },
  allowed_signup_domains: {
    name: 'Allowed Signup Domains',
    readOnly: false,
    columns: [
      { key: 'id', label: 'ID', type: 'text', mono: true, hideInForm: true },
      { key: 'apex_domain', label: 'Domain', type: 'text' },
    ]
  },
  humor_flavor_mix: {
    name: 'Humor Mix',
    readOnly: false,
    columns: [
      { key: 'id', label: 'ID', type: 'text', mono: true, hideInForm: true },
      { key: 'humor_flavor_id', label: 'Flavor ID', type: 'text' },
      { key: 'caption_count', label: 'Caption Count', type: 'number' },
    ]
  },
  llm_model_responses: {
    name: 'LLM Responses',
    readOnly: true,
    columns: [
      { key: 'id', label: 'ID', type: 'text', mono: true },
      { key: 'llm_model_response', label: 'Response', type: 'textarea' },
      { key: 'llm_model_id', label: 'Model ID', type: 'text' },
      { key: 'created_datetime_utc', label: 'Created', type: 'date' },
    ]
  },
  whitelist_email_addresses: {
    name: 'Whitelisted Emails',
    readOnly: false,
    columns: [
      { key: 'id', label: 'ID', type: 'text', mono: true, hideInForm: true },
      { key: 'email_address', label: 'Email Address', type: 'text' },
    ]
  },
}
