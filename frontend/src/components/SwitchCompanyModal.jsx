import { useAuthStore } from "../store/useAuthStore";
import { useCompanyStore } from "../store/useCompanyStore";
import { useRef, useEffect } from "react";

const SwitchCompanyModal = ({ isOpen, onClose }) => {
  const dialogRef = useRef();
  const { authUser } = useAuthStore();
  const { switchCompany, isSwitching, switchingTo } = useCompanyStore();
  const { activeCompany, companies } = authUser;
  console.log(`authUser`, authUser);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      id="switch_company_modal"
      className={`modal ${isOpen ? "modal-open" : ""}`}
      onCancel={(e) => e.preventDefault()}
      onClose={onClose}
    >
      <div
        className="modal-box w-full max-w-xl sm:w-[90%]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base-content border-base-300 mb-4 border-b pb-6 text-xl font-semibold">
          Switch Company
        </h3>

        {companies.length === 0 ? (
          <div className="text-base-content text-center">
            No companies found.
          </div>
        ) : (
          <div className="max-h-[60vh] space-y-3 overflow-y-auto pt-2">
            {[...companies]
              .sort((a, b) =>
                a.companyId._id === activeCompany
                  ? -1
                  : b.companyId._id === activeCompany
                    ? 1
                    : 0,
              )
              .map((company) => (
                <div
                  key={company.companyId._id}
                  className={`flex items-center justify-between rounded-md border p-2.5 transition duration-200 ${
                    activeCompany === company.companyId._id
                      ? "border-primary/30 bg-primary/10"
                      : "bg-base-100 border-base-300"
                  }`}
                >
                  <div className="flex items-center gap-3 py-2">
                    <div className="flex flex-col">
                      <span className="font-normal">{company.name}</span>
                      <span className="text-base-content/50 mt-1.5 max-w-[200px] truncate text-sm opacity-70 sm:max-w-[300px]">
                        {company.description}
                      </span>
                    </div>
                  </div>

                  <div className="-mt-8 flex items-center gap-2">
                    {activeCompany === company.companyId._id ? (
                      <div className="text-primary bg-primary/20 rounded-3xl px-2 py-0.5 text-xs">
                        Active
                      </div>
                    ) : (
                      <button
                        className="text-primary hover:border-primary hover:bg-base-100 cursor-pointer rounded-md border border-transparent px-1.5 py-1 text-sm transition-colors duration-300"
                        onClick={() => {
                          switchCompany(company.companyId._id);
                          onClose();
                        }}
                        disabled={isSwitching}
                      >
                        {isSwitching && switchingTo === company.companyId
                          ? "Switching..."
                          : "Set Active"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Footer */}
        <div className="modal-action border-base-300 mt-6 border-t">
          <button
            className="border-base-300 hover:bg-base-200 mt-6 w-full cursor-pointer rounded-lg border p-3 font-normal"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default SwitchCompanyModal;
