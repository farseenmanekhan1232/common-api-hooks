

# Common API Hooks

This is a fork of the original [React Hooks](https://marketplace.visualstudio.com/items?itemName=AyushmaanSingh.custom-react-hooks) VSCode extension, converted into an npm package that can be run with npx.

## Features

- Easily add common API hooks to your React project.
- Customize or extend hooks to suit your needs.
- Save time and reduce boilerplate code in your React projects.

## Usage

1. Navigate to your React project directory in the terminal.
2. Run the following command:
```

npx common-api-hooks

````

3. Find your hooks in the `src/hooks`, `src/app/hooks`, or `app/hooks` directory, depending on your project structure.

## Hooks

List of hooks available:

- **`useDebounce`**: Debounces a value for a specified delay.
- **`useThrottle`**: Throttles a callback function for a specified delay.
- **`useFetch`**: Fetches data from a specified URL.
- **`useLocalStorage`**: Synchronizes state with `localStorage`.
- **`useApi`**: A versatile hook for making API requests with different HTTP methods.
- **`usePagination`**: Manages paginated API requests, including page navigation and data fetching.
- **`useInfiniteScroll`**: Implements infinite scrolling, automatically fetching more data as the user scrolls.

## Example Usage

After running the npx command, you can use the hooks in your React components like this:

```jsx
import { useApi } from './hooks/useApi';

function MyComponent() {
const { data, loading, error, request } = useApi('https://api.example.com');

React.useEffect(() => {
 request('/users');
}, [request]);

if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;

return (
 <div>
   {data && data.map(user => <div key={user.id}>{user.name}</div>)}
 </div>
);
}
````

## Contribution

Contributions are welcome! If you'd like to add more useful hooks or improve the existing ones, feel free to open a pull request or an issue on the GitHub repository.

## Original Creator

The original React Hooks VSCode extension was created and maintained by:

Ayushmaan Singh

- [Twitter](https://twitter.com/ayushmxxn)
- [GitHub](https://github.com/ayushmxxn)

## License

This project is licensed under the [MIT License](LICENSE).
