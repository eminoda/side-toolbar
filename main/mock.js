const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("_Mock", {
  getMockApiList: function () {
    const mockApiList = [
      {
        template: "/unitrust-id-admin",
        responseData: {
          code: 0,
          result: {
            token: 11
          }
        },
      },
    ];
    return mockApiList;
  },
});
