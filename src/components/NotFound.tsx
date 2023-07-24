export const NotFoundPage = (props: { resourceName: string }) => (
  <div className="flex h-32 items-center justify-center text-2xl italic">
    {props.resourceName} not found <p className="p-2 not-italic">😢</p>
  </div>
);
