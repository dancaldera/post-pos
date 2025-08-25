import { useState } from "preact/hooks";
import { Button, Input, Heading, Text } from "../components/ui";

export default function ComponentShowcase() {
  const [inputValue, setInputValue] = useState("");
  const [inputWithError, setInputWithError] = useState("");
  const [error, setError] = useState("");

  const handleInputChange = (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    setInputValue(value);
  };

  const handleErrorInputChange = (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    setInputWithError(value);
    
    if (value.length < 3) {
      setError("Must be at least 3 characters");
    } else {
      setError("");
    }
  };

  return (
    <div class="space-y-8">
      <div class="bg-white rounded-lg shadow p-6">
        <Heading level={1}>UI Components Showcase</Heading>
        <Text variant="lead" color="muted" class="mt-2">
          This is a developer showcase for all UI components in the system.
        </Text>
      </div>

      {/* Typography Showcase */}
      <div class="bg-white rounded-lg shadow p-6">
        <Heading level={2}>Typography Components</Heading>
        
        <div class="space-y-6 mt-6">
          <div>
            <Text variant="caption" color="muted" class="mb-3">Headings</Text>
            <div class="space-y-3">
              <Heading level={1}>Heading Level 1</Heading>
              <Heading level={2}>Heading Level 2</Heading>
              <Heading level={3}>Heading Level 3</Heading>
              <Heading level={4}>Heading Level 4</Heading>
              <Heading level={5}>Heading Level 5</Heading>
              <Heading level={6}>Heading Level 6</Heading>
            </div>
          </div>

          <div>
            <Text variant="caption" color="muted" class="mb-3">Heading Sizes</Text>
            <div class="space-y-3">
              <Heading level={2} size="4xl">Custom 4XL Size</Heading>
              <Heading level={3} size="2xl" color="success">Success Colored Heading</Heading>
              <Heading level={4} weight="normal" align="center">Centered Normal Weight</Heading>
            </div>
          </div>

          <div>
            <Text variant="caption" color="muted" class="mb-3">Text Variants</Text>
            <div class="space-y-3">
              <Text variant="lead">Lead text - larger and more prominent for introductions</Text>
              <Text variant="body">Body text - the standard text used in most content</Text>
              <Text variant="caption">Caption text - smaller text for captions and metadata</Text>
              <Text variant="small">Small text - the smallest text size available</Text>
            </div>
          </div>

          <div>
            <Text variant="caption" color="muted" class="mb-3">Text Colors & Styles</Text>
            <div class="space-y-2">
              <Text color="primary">Primary text color</Text>
              <Text color="secondary">Secondary text color</Text>
              <Text color="muted">Muted text color</Text>
              <Text color="success">Success text color</Text>
              <Text color="warning">Warning text color</Text>
              <Text color="danger">Danger text color</Text>
              <Text weight="bold">Bold text weight</Text>
              <Text decoration="underline">Underlined text</Text>
              <Text transform="uppercase">Uppercase text</Text>
              <Text truncate class="w-48">This is a very long text that will be truncated when it exceeds the container width</Text>
            </div>
          </div>

          <div>
            <Text variant="caption" color="muted" class="mb-3">Text Elements</Text>
            <div class="space-y-2">
              <Text as="p">Paragraph element</Text>
              <Text as="span">Span element (inline)</Text>
              <Text as="strong" weight="bold">Strong element</Text>
              <Text as="em">Emphasized element</Text>
              <Text as="small" variant="small">Small element</Text>
            </div>
          </div>
        </div>
      </div>

      {/* Button Showcase */}
      <div class="bg-white rounded-lg shadow p-6">
        <h4 class="text-md font-medium mb-4">Button Variants</h4>
        
        <div class="space-y-4">
          <div>
            <h5 class="text-sm font-medium text-gray-700 mb-2">Primary Buttons</h5>
            <div class="flex flex-wrap gap-2">
              <Button variant="primary" size="sm">Small Primary</Button>
              <Button variant="primary" size="md">Medium Primary</Button>
              <Button variant="primary" size="lg">Large Primary</Button>
            </div>
          </div>

          <div>
            <h5 class="text-sm font-medium text-gray-700 mb-2">Secondary Buttons</h5>
            <div class="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm">Small Secondary</Button>
              <Button variant="secondary" size="md">Medium Secondary</Button>
              <Button variant="secondary" size="lg">Large Secondary</Button>
            </div>
          </div>

          <div>
            <h5 class="text-sm font-medium text-gray-700 mb-2">Outline Buttons</h5>
            <div class="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">Small Outline</Button>
              <Button variant="outline" size="md">Medium Outline</Button>
              <Button variant="outline" size="lg">Large Outline</Button>
            </div>
          </div>

          <div>
            <h5 class="text-sm font-medium text-gray-700 mb-2">Ghost Buttons</h5>
            <div class="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm">Small Ghost</Button>
              <Button variant="ghost" size="md">Medium Ghost</Button>
              <Button variant="ghost" size="lg">Large Ghost</Button>
            </div>
          </div>

          <div>
            <h5 class="text-sm font-medium text-gray-700 mb-2">Danger Buttons</h5>
            <div class="flex flex-wrap gap-2">
              <Button variant="danger" size="sm">Small Danger</Button>
              <Button variant="danger" size="md">Medium Danger</Button>
              <Button variant="danger" size="lg">Large Danger</Button>
            </div>
          </div>

          <div>
            <h5 class="text-sm font-medium text-gray-700 mb-2">Disabled States</h5>
            <div class="flex flex-wrap gap-2">
              <Button variant="primary" disabled>Disabled Primary</Button>
              <Button variant="outline" disabled>Disabled Outline</Button>
              <Button variant="danger" disabled>Disabled Danger</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Input Showcase */}
      <div class="bg-white rounded-lg shadow p-6">
        <h4 class="text-md font-medium mb-4">Input Components</h4>
        
        <div class="space-y-6 max-w-md">
          <div>
            <h5 class="text-sm font-medium text-gray-700 mb-3">Basic Inputs</h5>
            <div class="space-y-4">
              <Input
                label="Small Input"
                placeholder="Small size input"
                size="sm"
              />
              <Input
                label="Medium Input"
                placeholder="Medium size input"
                size="md"
              />
              <Input
                label="Large Input"
                placeholder="Large size input"
                size="lg"
              />
            </div>
          </div>

          <div>
            <h5 class="text-sm font-medium text-gray-700 mb-3">Input with Value</h5>
            <Input
              label="Controlled Input"
              placeholder="Type something..."
              value={inputValue}
              onInput={handleInputChange}
              helperText="This input is controlled by state"
            />
            <p class="mt-2 text-sm text-gray-500">Current value: "{inputValue}"</p>
          </div>

          <div>
            <h5 class="text-sm font-medium text-gray-700 mb-3">Required Input</h5>
            <Input
              label="Required Field"
              placeholder="This field is required"
              required
              helperText="This field has a required indicator"
            />
          </div>

          <div>
            <h5 class="text-sm font-medium text-gray-700 mb-3">Input with Error</h5>
            <Input
              label="Validation Input"
              placeholder="Type at least 3 characters"
              value={inputWithError}
              onInput={handleErrorInputChange}
              error={error}
              helperText={!error ? "Helper text appears when no error" : undefined}
            />
          </div>

          <div>
            <h5 class="text-sm font-medium text-gray-700 mb-3">Different Input Types</h5>
            <div class="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="user@example.com"
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
              />
              <Input
                label="Number"
                type="number"
                placeholder="123"
              />
              <Input
                label="Search"
                type="search"
                placeholder="Search something..."
              />
            </div>
          </div>

          <div>
            <h5 class="text-sm font-medium text-gray-700 mb-3">Disabled Input</h5>
            <Input
              label="Disabled Input"
              placeholder="This input is disabled"
              disabled
              value="Cannot be edited"
            />
          </div>
        </div>
      </div>

      {/* Interactive Examples */}
      <div class="bg-white rounded-lg shadow p-6">
        <h4 class="text-md font-medium mb-4">Interactive Examples</h4>
        
        <div class="space-y-4">
          <div>
            <h5 class="text-sm font-medium text-gray-700 mb-3">Form Example</h5>
            <form class="space-y-4 max-w-md">
              <Input
                label="First Name"
                placeholder="Enter your first name"
                required
              />
              <Input
                label="Last Name"
                placeholder="Enter your last name"
                required
              />
              <Input
                label="Email"
                type="email"
                placeholder="Enter your email"
                required
              />
              <div class="flex gap-2">
                <Button type="submit" variant="primary">
                  Submit Form
                </Button>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}