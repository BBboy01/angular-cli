/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import type { Compiler } from 'webpack';
import { augmentAppWithServiceWorker } from '../../utils/service-worker';

export interface ServiceWorkerPluginOptions {
  projectRoot: string;
  root: string;
  baseHref?: string;
  ngswConfigPath?: string;
}

export class ServiceWorkerPlugin {
  constructor(private readonly options: ServiceWorkerPluginOptions) {}

  apply(compiler: Compiler) {
    compiler.hooks.done.tapPromise('angular-service-worker', async ({ compilation }) => {
      const { projectRoot, root, baseHref = '', ngswConfigPath } = this.options;
      // We use the output path from the compilation instead of build options since during
      // localization the output path is modified to a temp directory.
      // See: https://github.com/angular/angular-cli/blob/7e64b1537d54fadb650559214fbb12707324cd75/packages/angular_devkit/build_angular/src/utils/i18n-options.ts#L251-L252
      const outputPath = compilation.outputOptions.path;

      if (!outputPath) {
        throw new Error('Compilation output path cannot be empty.');
      }

      await augmentAppWithServiceWorker(
        projectRoot,
        root,
        outputPath,
        baseHref,
        ngswConfigPath,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (compiler.inputFileSystem as any).promises,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (compiler.outputFileSystem as any).promises,
      );
    });
  }
}
