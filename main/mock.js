const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("_Mock", {
  getMockApiList: function () {
    const mockApiList = [
      {
        template: "/sugrec",
        responseData: { err_no: 0, errmsg: "", queryid: "0xcafffea3ee4a37" },
      },
    ];
    return mockApiList;
  },
});
