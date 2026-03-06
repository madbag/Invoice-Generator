import ClientList from "../components/Clients/ClientList";

const ClientPage = () => {
  return (
    <div>
      {/* Dashboard Content */}
      <main className="p-6 flex flex-row items-center justify-center w-full">
        <ClientList />
      </main>
    </div>
  );
};

export default ClientPage;
